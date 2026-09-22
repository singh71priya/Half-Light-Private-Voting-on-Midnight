import { describe, expect, it } from 'vitest';
import { deriveNullifier, generateVoterSecret, shortHex } from '../lib/hash';

describe('hash.ts — nullifier derivation (mirrors deriveNullifier in the .compact contract)', () => {
  it('generateVoterSecret returns a 32-byte (64 hex char) secret', () => {
    const secret = generateVoterSecret();
    expect(secret).toHaveLength(64);
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generateVoterSecret is not deterministic across calls', () => {
    const a = generateVoterSecret();
    const b = generateVoterSecret();
    expect(a).not.toBe(b);
  });

  it('deriveNullifier is deterministic for the same inputs (needed to catch double votes)', async () => {
    const n1 = await deriveNullifier('election-x', 'secret-123');
    const n2 = await deriveNullifier('election-x', 'secret-123');
    expect(n1).toBe(n2);
  });

  it('deriveNullifier changes when the secret changes', async () => {
    const n1 = await deriveNullifier('election-x', 'secret-a');
    const n2 = await deriveNullifier('election-x', 'secret-b');
    expect(n1).not.toBe(n2);
  });

  it('deriveNullifier changes across elections for the same secret (unlinkability)', async () => {
    const n1 = await deriveNullifier('election-x', 'same-secret');
    const n2 = await deriveNullifier('election-y', 'same-secret');
    expect(n1).not.toBe(n2);
  });

  it('shortHex truncates long hex strings with an ellipsis', () => {
    const hex = 'a'.repeat(64);
    expect(shortHex(hex)).toBe('aaaaaa…aaaaaa');
  });

  it('shortHex leaves short strings untouched', () => {
    expect(shortHex('abcd')).toBe('abcd');
  });
});
