# ADR-0001: Write the bot in TypeScript

- Status: Accepted
- Date: 2026-11-24
- Deciders: James

## Context

No code exists yet, so the language is an open choice. The walking skeleton needs one now, and it is expensive to change once the bot grows. The deciding criteria are the quality goals in arc42 section 1.2: autonomy (Q1) and modifiability (Q2) come first; observability (Q3) and CPU (Q4) are not affected by the choice.

## Options considered

1. **TypeScript**, compiled to JavaScript before upload.
2. **JavaScript**, uploaded as written.

Rust or C compiled to WebAssembly was noted and set aside as a much bigger step up in complexity for a spare-time project.

| Criterion | TypeScript | JavaScript |
|-----------|------------|------------|
| Q1 Autonomy | Type errors caught before upload, so fewer bad deploys break the colony unattended | Errors surface only at runtime, possibly hours later |
| Q2 Modifiability | Types and community Screeps type definitions make refactoring safer | Refactoring relies on care and tests |
| Q3 Observability | No difference | No difference |
| Q4 CPU | No difference after compilation | No difference |
| Cost | Needs a build step | Can be pasted straight in |

## Decision

Write the bot in TypeScript.

## Consequences

- Positive: many mistakes are caught before the code reaches the server, which protects unattended play; larger refactors are safer as the bot grows.
- Negative: a build step is required between editing and running. This is addressed by ADR-0002 (build and deploy).
- The community's Screeps type definitions become a dependency and must be kept roughly in step with the server's game version.
