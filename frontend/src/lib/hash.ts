/**
 * hash.ts
 * -------------------------------------------------------------------------
 * IMPORTANT: this file is a TypeScript **mirror** of the nullifier derivation
 * that actually happens inside `deriveNullifier` in
 * `contract/src/private-voting.compact`, executed in-circuit with
 * `persistentHash`. It exists so that:
 *
 *   1. The frontend can run in "demo mode" against `votingSimulator.ts`
 *      without a live Midnight node, for local development and CI tests.
 *   2. We have deterministic, unit-testable logic for the nullifier scheme
 *      that this project is built around.
 *
 * When wiring to a real deployed contract (see `midnightClient.ts`), the
 * *actual* nullifier is produced inside the ZK proof by the Compact
 * runtime — this helper is never used to derive the value that gets
 * submitted on-chain in production mode.
 * -------------------------------------------------------------------------
 */

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Generates a fresh, random per-device voter secret (kept in localStorage only). */
export function generateVoterSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Mirrors `deriveNullifier(sk)` from the Compact contract:
 * nullifier = H(electionMetaHash || sk)
 *
 * Bound to a fixed, per-election value (electionId here stands in for the
 * on-chain `electionMetaHash`, which never changes after construction) and
 * the voter's secret key — and nothing else. This is what makes the
 * derivation deterministic per (election, voter) pair: the same secret
 * always yields the same nullifier for a given election (so a second vote
 * is caught), while yielding a *different* nullifier for any other
 * election (so ballots can't be linked across elections). It is a
 * one-way function: recovering `sk` from the public nullifier is
 * computationally infeasible.
 */
export async function deriveNullifier(electionId: string, secretHex: string): Promise<string> {
  return sha256Hex(`${electionId}:${secretHex}`);
}

export function shortHex(hex: string, chars = 6): string {
  if (hex.length <= chars * 2) return hex;
  return `${hex.slice(0, chars)}…${hex.slice(-chars)}`;
}
