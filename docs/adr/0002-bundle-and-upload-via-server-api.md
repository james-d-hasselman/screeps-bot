# ADR-0002: Bundle with a build tool and upload through the server API

- Status: Accepted (2026-11-25, after the deploy spike passed)
- Date: 2026-11-24
- Deciders: James

## Context

ADR-0001 chose TypeScript, so code must be compiled before it runs. Requirement F5 asks for one command that takes the source and gets it running on the private server. The server currently runs through the Steam client, and may move into a Docker container later. Quality goal Q1 (autonomy) favours a deploy path that does not depend on anything being open on James's machine.

## Options considered

1. **Upload through the server's HTTP API.** A build tool compiles and bundles the TypeScript into one `main.js`; a deploy script uploads it to the server. Requires the `screepsmod-auth` mod on the server so the API accepts a password.
2. **Write into the game client's local scripts folder.** The build writes `main.js` into the Steam client's per-server scripts folder, which the client syncs while connected. No server mod needed.

| Criterion | 1. Server API | 2. Client folder |
|-----------|---------------|------------------|
| F5 one command | Yes: build and upload in one step | Build is one step; sync depends on the client |
| Q1 Autonomy | Works with no client open | Needs the Steam client open and connected |
| Move to Docker | Unchanged; only the server address in config changes | Has to be redone |
| Server setup | Install `screepsmod-auth`, set a password | None |

## Decision

Bundle the TypeScript into a single `main.js` with a build tool and upload it through the server's HTTP API, using `screepsmod-auth` for authentication. Candidate (chosen 2026-11-24 over building a pipeline from scratch): the community [screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter), which bundles with Rollup and uploads with `rollup-plugin-screeps`, and already has a private-server (`pserver`) destination using username and password. Its toolchain is dated (pins Node 16, TypeScript 4.8, Rollup 2; upload plugin last released 2022), so dependencies will be upgraded over time and a lockfile committed.

Fallback if the starter fails the spike: a minimal own pipeline (a bundler such as esbuild plus a short script that signs in and posts `main.js` to the server API).

Server address, username and password live in a local config file that is never committed.

## Consequences

- Positive: one command deploys; works the same on Steam or Docker; nothing needs to be open on James's machine.
- Negative: `screepsmod-auth` must be installed and a password set on the server.
- Negative: the starter brings inherited code and old dependencies. Its sample `role` creep memory is removed, since the overall structure is deliberately undecided (arc42 section 4). Its error mapper costs over 30 CPU on the first error after a global reset (relevant to Q4 later).
- Confirmed 2026-11-25: from a VS Code dev container on Node 24, `npm run push-pserver` built and uploaded the starter's hello-world bot, and the game console showed `Current game tick is ...`. The starter builds on Node 24 despite pinning Node 16.
- The server it deploys to is described in ADR-0003.
