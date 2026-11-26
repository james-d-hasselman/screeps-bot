# ADR-0003: Run the private server with screeps-launcher in Docker on a Proxmox VM

- Status: Accepted
- Date: 2026-11-25
- Deciders: James

## Context

The deploy spike (slice 1) found that the server started from inside the Steam game client cannot easily take npm mods such as `screepsmod-auth`, which ADR-0002 needs, and stops when the client closes, which conflicts with Q1 (autonomy: weeks of unattended play). James already runs another game server in Docker on a Proxmox VM on an isolated network for game servers, and planned to move Screeps to Docker eventually.

## Options considered

1. **Keep the in-client server** and deploy by writing into the client's local scripts folder (ADR-0002 option 2).
2. **screeps-launcher natively on Windows**: one `.exe`, mods from `config.yml`.
3. **screeps-launcher in Docker on a Proxmox VM**, with MongoDB and Redis, on the same isolated network.

| Criterion | 1. In-client | 2. Launcher on Windows | 3. Launcher in Docker on VM |
|-----------|--------------|------------------------|-----------------------------|
| Q1 Autonomy | Stops when the client closes | Stops when the PC sleeps | Runs independently of the PC |
| Mods (ADR-0002 needs screepsmod-auth) | Hard | Easy | Easy |
| Fits existing homelab pattern | No | No | Yes (same as the existing game server) |
| Setup effort | None | Low | Medium |

## Decision

Run the server with `screepers/screeps-launcher` plus `mongo:8` and `redis:8` in Docker Compose on a Debian 13 VM on the isolated game-server network, LAN-only on TCP 21025. Mods: `screepsmod-mongo`, `screepsmod-auth`, `screepsmod-admin-utils`. Setup steps live in the "Screeps Dedicated Server Setup" doc.

## Consequences

- Positive: the world runs with nothing open on the PC; mods are a list in `config.yml`; same pattern and backups as the existing game server.
- Negative: more moving parts (VM, three containers). `screepsmod-auth` 2.9 and 2.10 crash on load with `screepsmod-mongo`, so it is pinned to 2.8.3 via `extraPackages` until fixed upstream.
- Plain HTTP on the LAN only. Exposing it to the internet later needs HTTPS in front and a server password; that would be a new ADR.
