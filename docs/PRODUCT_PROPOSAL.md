# Product Proposal — Half Light: Private Voting on Midnight

**Idea selected from the provided list:** Private Voting — anonymous ballots
with publicly verifiable tallies.

## Problem

Most "on-chain voting" today is either fully transparent (every vote is
linkable to a wallet, enabling coercion, vote-buying, and social pressure)
or fully opaque (trust-me tallies run off-chain with no way to audit the
result). Communities, DAOs, and small organizations need a middle ground:
**nobody should be able to see how you voted, but everybody should be able
to verify the count.**

## Why Midnight fits this problem

Midnight's Compact language makes "private by default, disclosure by
exception" a compiler-enforced property rather than a convention. That is
exactly the shape of a good ballot:

- The **fact that a vote happened**, and **which running counter it moved**,
  is explicitly disclosed (public tally).
- The **voter's identity** and **which specific choice a specific person
  made** are never disclosed — they exist only as a witness inside the
  voter's own device, reduced to a one-way nullifier before it ever reaches
  the ledger.

## What we built

- A `private-voting.compact` contract with an admin-gated lifecycle
  (`CREATED → OPEN → CLOSED`), a nullifier-based double-vote guard, and two
  public counters (`yesVotes`, `noVotes`).
- A production-styled React/TypeScript frontend ("Half Light") with:
  - A live tally visualization,
  - A ballot form with real-time state gating (can't vote twice, can't vote
    outside the open window),
  - A public nullifier-registry explorer so anyone can audit "how many
    people voted" without learning "who,"
  - An explicit **Privacy Model** panel spelling out exactly what's visible
    vs. hidden,
  - An admin panel to open/close the election.
- A `VotingSimulator` that mirrors the contract's circuits 1:1 in
  TypeScript, used both to run the full demo without a live node and as the
  backbone of a 25-test, CI-enforced test suite.

## Target users

- DAOs running treasury/governance polls where voter privacy reduces
  coercion and vote-buying,
- Community organizations running sensitive internal ballots (e.g.
  personnel, policy changes),
- Any group that currently uses a Google Form (no verifiability) or a fully
  public on-chain vote (no privacy) and wants both properties at once.

## Roadmap beyond Level 3

1. Multi-option (not just yes/no) ballots using a `Map<Uint<8>, Counter>`
   tally structure.
2. Eligibility gating via a Merkle-tree membership proof (reusing the
   "Private Allowlist Access" pattern) so only pre-registered addresses can
   vote, still anonymously.
3. Delegated/liquid voting.
4. A hosted multi-election dashboard instead of a single hard-coded
   election id.
