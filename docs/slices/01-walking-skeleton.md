# Slice 1: Walking skeleton

## Problem statement

> I have no code running, so my room does nothing and my controller will downgrade. I need a minimal loop that keeps exactly one creep alive, harvesting energy and upgrading the controller, so I have a working deploy pipeline and baseline numbers to build on.

## Requirements

| ID | Requirement | Serves |
|----|-------------|--------|
| F1 | If no creep is alive, the spawn creates one as soon as it has enough energy. | R1 |
| F2 | The creep harvests until full, upgrades the controller until empty, and repeats. | R1 |
| F3 | Never more than one creep. | Slice scope |
| F4 | Every so often, log CPU used, `Game.cpu.limit` and controller progress to the console. | Q3 |
| F5 | One command builds and deploys. | ADR-0002 |
| F6 | After a global reset the bot carries on with no help. | Q1 |

**Non-goals for this slice:** more than one creep, building anything, defence, other rooms, CPU tuning, choosing the overall structure.

**Done when:** after one deploy, a creep appears and controller progress rises; when that creep dies of old age, a replacement appears with no help.

## Spikes

### Spike 1: deploy hello world (time box: 1 hour)

Question: does `npm run push-pserver` from the screeps-typescript-starter, on a current Node LTS, put a hello-world bot on James's private server?

Steps:
1. Install `screepsmod-auth` on the server and set a password for James's user.
2. Clone the starter, run `npm install` on the current Node LTS.
3. Copy `screeps.sample.json` to `screeps.json` and fill in the `pserver` entry (host, port 21025, username, password).
4. Run `npm run push-pserver`.
5. In the game console, see `Current game tick is ...` each tick.

Success: step 5 happens within the time box. ADR-0002 becomes Accepted.
Failure: note where it broke; fall back to a minimal own pipeline (ADR-0002) and record why.

Result: **passed 2026-11-25.** `npm run push-pserver` from the dev container uploaded the hello-world bot and the console logged `Current game tick is ...`. ADR-0002 Accepted; ADR-0003 records the server move. It took one evening rather than one hour, because the server had to move first.

Findings:
- Finding 1: James's dev machine is Windows with no Node.js. Node LTS must be installed for the build regardless of deploy choice.
- Finding 2: the server is the one started from inside the Steam client. It has no simple way to add npm mods such as `screepsmod-auth`, and (to be confirmed) only runs while the client is open, which conflicts with Q1. ADR-0002's assumption "screepsmod-auth can be installed" does not hold for this setup. Decision (James, 2026-11-24): move to a standalone server now and keep ADR-0002. Candidate: screeps-launcher (runs natively on Windows, installs mods from `config.yml`, manages its own Node, same config runs in Docker later). To be recorded as ADR-0003.
- Finding 3 (2026-11-25): server built on a Proxmox VM on the home LAN with screeps-launcher + MongoDB + Redis in Docker, following the "Screeps Dedicated Server Setup" doc. screepsmod-auth 2.9/2.10 crashes on load with screepsmod-mongo (reads `config.mongo.client` before Mongo connects); pinned to 2.8.3 via `extraPackages`. Build/deploy moved into a VS Code dev container on Node 24.
- Finding 4 (2026-11-25): the starter builds on Node 24 (`created dist/main.js in 3.1s`) and reaches the server from the dev container; first upload refused with `Not Authorized` (username or password mismatch); fixed by setting the password with `auth.setPassword` for the exact username.

## Design it twice

Only decisions with a real alternative are compared here. The behaviour itself (fill at the source, empty into the controller, repeat) has one sensible shape. How many creeps are organised (roles, managers, tasks) stays deferred to the first multi-creep slice (arc42 section 4).

### Decision 1: how the creep knows whether to harvest or upgrade

| | A. Decide from what it carries, no state | B. `working` flag in creep Memory |
|---|---|---|
| F2 harvest until full, upgrade until empty | Fails. A rule on the store alone (for example "harvest unless full") upgrades for one tick, drops below full and turns back, so the creep flips between the two. | Works. The flag flips only when the creep is full or empty. |
| F6 global reset | Nothing to lose. | Nothing lost either: a global reset clears global scope only, and Memory persists. |
| Q1 autonomy | Creep makes no progress. | Creep carries on after a reset. |

**Chosen: B** (James, 2026-11-25). A cannot meet F2, and its supposed advantage under F6 does not exist because Memory survives a global reset.

### Decision 2: when to replace the creep

| | A. Spawn after the old creep dies | B. Spawn ahead, when the old creep's remaining life drops below the spawn time |
|---|---|---|
| F1 spawn when no creep is alive | Matches it exactly. | Spawns while one is still alive; F1 would need rewording. |
| F3 never more than one creep | Holds. | Breaks for a short overlap. |
| Upgrading | Stops for the spawn time plus the walk to the source (a gap each creep lifetime). | No gap. |
| Simplicity | One check: is there a creep? | Needs the spawn time, the creep's remaining life and the walk time. |

**Chosen: A** (James, 2026-11-25). It fits F1 and F3 as written and is the simplest thing that works. The upgrading gap is a known cost; pre-spawning can come back in a later slice if the numbers from F4 show the gap matters.

