# 🌗 Half Light — Private Voting on Midnight

> Half light, half shadow — exactly as much of a vote is disclosed as the
> voter decides. Anonymous ballots, publicly verifiable tallies.
>
> **Midnight Builder Challenge — Level 3 ("First Quarter")**
> **Idea from the provided list:** Private Voting — anonymous ballots with
> publicly verifiable tallies.

[![CI](https://github.com/singh71priya/Half-Light-Private-Voting-on-Midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/singh71priya/Half-Light-Private-Voting-on-Midnight/actions/workflows/ci.yml)
[![Deploy to Preprod](https://github.com/singh71priya/Half-Light-Private-Voting-on-Midnight/actions/workflows/deploy.yml/badge.svg)](https://github.com/singh71priya/Half-Light-Private-Voting-on-Midnight/actions/workflows/deploy.yml)
![License](https://img.shields.io/badge/license-MIT-b9a9ff)
![Tests](https://img.shields.io/badge/tests-25%20passing-4ade80)

### ⛓️ Verified On-Chain Midnight Preprod Deployment
- **Network**: `Midnight Preprod`
- **Contract Address**: [`937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2`](https://preprod.midnight.network/contract/937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2)
- **Explorer Link**: [https://preprod.midnight.network/contract/937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2](https://preprod.midnight.network/contract/937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2)
- **DUST Registration Tx**: [`002bdd733466cbcb726d4a9e02cdab846b3016442a38e0a8607bb4f8d70f9ef687`](https://preprod.midnight.network/tx/002bdd733466cbcb726d4a9e02cdab846b3016442a38e0a8607bb4f8d70f9ef687)
- **Wallet Address**: `mn_addr_preprod10umsgsffs0l4evpt65n7ue7vyuuj3tyx8asq7evhy8v755kcgeqsnwhew4`

---

## Table of contents

- [What this is](#what-this-is)
- [Why Midnight](#why-midnight)
- [Architecture](#architecture)
- [Privacy model — what an observer can and cannot learn](#privacy-model--what-an-observer-can-and-cannot-learn)
- [Getting started](#getting-started)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Project structure](#project-structure)
- [Product proposal](#product-proposal)
- [Roadmap](#roadmap)
- [Security notes](#security-notes)

---

## What this is

A full-stack dApp for running a **single yes/no election** where:

- Anyone can verify the running tally and the election's lifecycle in real
  time, on-chain.
- No one — not even the contract — can ever tie a specific ballot back to a
  specific voter.
- Double voting is cryptographically prevented via a **nullifier**, a
  one-way hash of a private per-device secret, without that secret (or the
  identity behind it) ever being disclosed.

It ships in two layers, kept in lock-step:

1. **`contract/src/private-voting.compact`** — the real Compact smart
   contract: ledger state, an admin-gated lifecycle, and the
   `castVote` circuit that enforces the nullifier check.
2. **`frontend/`** — a polished React + TypeScript + Tailwind UI, plus a
   `VotingSimulator` (`frontend/src/lib/votingSimulator.ts`) that mirrors the
   contract's circuits 1:1 in plain TypeScript, so the entire flow can be
   demoed and unit-tested with **zero infrastructure** (no wallet, no node,
   no testnet tokens) — flip one flag (`DEMO_MODE` in
   `frontend/src/lib/midnightClient.ts`) to point the same UI at a real
   deployed contract instead.

## Why Midnight

Compact's compiler enforces "private by default, disclosure by exception"
(`disclose()`). That maps directly onto what a good ballot needs: the
*count* is public and auditable, the *voter* and their *choice* never are,
and the compiler — not developer discipline — is what guarantees it.

## Architecture

```
                ┌────────────────────────────┐
                │        Voter's browser      │
                │  (holds a random 32-byte    │
                │   secret in localStorage)   │
                └───────────────┬────────────┘
                                │ witness: voterSecretKey()
                                ▼
                ┌────────────────────────────┐
                │   private-voting.compact    │
                │                             │
                │  deriveNullifier(sk)        │  ← one-way hash, in-circuit
                │  castVote(choice)           │
                │   ├─ assert status == OPEN  │
                │   ├─ assert nullifier unused│
                │   ├─ insert nullifier       │
                │   └─ yesVotes / noVotes++   │
                └───────────────┬────────────┘
                                │ public ledger writes only
                                ▼
                ┌────────────────────────────┐
                │  Anyone / any block explorer│
                │  sees: status, tallies,     │
                │  nullifier set — nothing    │
                │  else.                      │
                └────────────────────────────┘
```

## Privacy model — what an observer can and cannot learn

| | |
|---|---|
| ✅ **Publicly visible** | Election metadata hash & lifecycle status (`CREATED` / `OPEN` / `CLOSED`) |
| ✅ **Publicly visible** | The running `yesVotes` / `noVotes` counters, updated after every ballot |
| ✅ **Publicly visible** | The set of nullifiers already consumed (proves double-voting is being enforced, without identifying anyone) |
| ✅ **Publicly visible** | The final result once the election is `CLOSED` |
| ⛔️ **Never disclosed** | Which wallet/person cast any specific ballot |
| ⛔️ **Never disclosed** | How any individual voted |
| ⛔️ **Never disclosed** | The voter's device secret key (`voterSecretKey`) — it is a `witness`, computed and consumed entirely locally; only its one-way hash (the nullifier) is ever wrapped in `disclose()` and written to the ledger |
| ⛔️ **Never disclosed** | Any link between a voter's ballots across two *different* elections (the nullifier is salted with the election's own metadata hash, so the same secret produces unrelated-looking nullifiers per election) |

The contract's `deriveNullifier` circuit is intentionally **not** salted
with anything that changes between calls (like a per-vote round counter) —
see the code comment in `private-voting.compact` explaining why that would
silently break double-vote protection. This exact bug was caught by this
repo's own test suite during development (see `votingSimulator.test.ts`),
which is why the fix is called out explicitly here.

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- *(optional, for real deployment only)* the
  [Compact toolchain](https://docs.midnight.network/getting-started/installation)
  and a Midnight-compatible wallet (e.g. Lace)

### Run the app (demo mode — no wallet or node required)

```bash
npm install
npm run dev --workspace frontend
```

Open the printed local URL. The app runs entirely against
`VotingSimulator`, an in-memory, in-browser mirror of the contract, so you
can open the election, cast ballots, and watch the tally + nullifier
registry update live.

### Compile the real contract (requires the Compact toolchain)

```bash
compact compile contract/src/private-voting.compact contract/managed/private-voting
```

### Wire the frontend to a live deployment

Open `frontend/src/lib/midnightClient.ts`, set `DEMO_MODE = false`, and
follow the `TODO(production)` block, which sketches the exact
`@midnight-ntwrk/midnight-js-contracts` calls needed (deploy, connect a
wallet provider, call `castTx.castVote(...)`).

## Testing

```bash
npm run test --workspace frontend      # watch-free run
npm run test:ci --workspace frontend   # verbose + coverage, used in CI
```

**25 tests, all passing**, covering:

- `votingSimulator.test.ts` (12 tests) — election lifecycle, double-vote
  rejection, per-voter nullifier uniqueness, tallying, result computation —
  this is a direct, line-by-line mirror of the Compact contract's circuits.
- `hash.test.ts` (7 tests) — nullifier determinism, per-election
  unlinkability, secret generation randomness.
- `BallotForm.test.tsx` (4 tests) — UI gating logic (can't vote twice,
  can't vote outside the open window).
- `App.test.tsx` (2 tests) — smoke tests for the full app shell.

The contract-level test scaffold in
`contract/src/test/private-voting.test.ts` documents how the same
assertions map onto the *compiled* contract once the Compact toolchain is
available (see the file header for details on why it's `describe.skip`'d by
default in this environment).

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. **`contract-compile`** — installs the Compact toolchain and compiles
   `private-voting.compact`, uploading the artifacts.
2. **`frontend`** — installs dependencies, lints, runs the full test suite
   with coverage, and builds the production bundle.

Add the CI badge at the top of this README once pushed (replace
`YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`).

## Project structure

```
midnight-private-vote/
├── contract/
│   ├── src/private-voting.compact     # the Compact smart contract
│   └── src/test/private-voting.test.ts
├── frontend/
│   ├── src/App.tsx
│   ├── src/components/                # StatusBadge, TallyChart, BallotForm,
│   │                                   # NullifierLedger, PrivacyPanel, AdminControls
│   ├── src/hooks/useElection.ts
│   ├── src/lib/
│   │   ├── hash.ts                    # nullifier derivation mirror
│   │   ├── votingSimulator.ts         # in-memory contract mirror
│   │   ├── midnightClient.ts          # demo/live client switch
│   │   └── types.ts
│   └── src/test/                      # 25 passing tests
├── docs/PRODUCT_PROPOSAL.md
├── .github/workflows/ci.yml
└── README.md
```

## Product proposal

See [`docs/PRODUCT_PROPOSAL.md`](docs/PRODUCT_PROPOSAL.md).

## Roadmap

- Multi-option ballots
- Merkle-tree eligibility gating (private allowlist)
- Delegated voting
- Multi-election dashboard

## Security notes

- The voter secret never leaves the browser except as a SHA-256 digest
  (demo mode) / in-circuit `persistentHash` output (production mode) —
  never logged, never sent to any server.
- Admin actions (`openElection`, `closeElection`) are gated by a hash
  check against the `admin` ledger field, not merely a UI-level check.
- This contract has **not** been professionally audited. Treat it as a
  hackathon-grade reference implementation, and see `docs/PRODUCT_PROPOSAL.md`
  for the hardening steps planned for a production rollout.
