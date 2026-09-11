import { describe, expect, it } from 'vitest';
import { VotingSimulator, computeResult, turnout } from '../lib/votingSimulator';

describe('VotingSimulator (mirrors private-voting.compact circuits)', () => {
  it('starts in CREATED status with zero tallies', () => {
    const sim = new VotingSimulator('election-a');
    expect(sim.state.status).toBe('CREATED');
    expect(sim.state.yesVotes).toBe(0);
    expect(sim.state.noVotes).toBe(0);
    expect(sim.state.nullifiers).toHaveLength(0);
  });

  it('rejects casting a vote before the election is opened', async () => {
    const sim = new VotingSimulator('election-b');
    const result = await sim.castVote('secret-1', 'YES');
    expect(result.ok).toBe(false);
    expect(sim.state.yesVotes).toBe(0);
  });

  it('openElection() moves status from CREATED to OPEN', () => {
    const sim = new VotingSimulator('election-c');
    sim.openElection();
    expect(sim.state.status).toBe('OPEN');
  });

  it('throws when opening an election that is already open', () => {
    const sim = new VotingSimulator('election-d');
    sim.openElection();
    expect(() => sim.openElection()).toThrow(/already been opened/i);
  });

  it('records a YES vote and increments the public tally only', async () => {
    const sim = new VotingSimulator('election-e');
    sim.openElection();
    const result = await sim.castVote('voter-secret-abc', 'YES');
    expect(result.ok).toBe(true);
    expect(sim.state.yesVotes).toBe(1);
    expect(sim.state.noVotes).toBe(0);
    expect(sim.state.nullifiers).toHaveLength(1);
  });

  it('records a NO vote independently of YES', async () => {
    const sim = new VotingSimulator('election-f');
    sim.openElection();
    await sim.castVote('voter-secret-def', 'NO');
    expect(sim.state.yesVotes).toBe(0);
    expect(sim.state.noVotes).toBe(1);
  });

  it('prevents the same secret from voting twice (double-vote protection)', async () => {
    const sim = new VotingSimulator('election-g');
    sim.openElection();
    const first = await sim.castVote('same-secret', 'YES');
    const second = await sim.castVote('same-secret', 'NO');

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.message).toMatch(/already cast/i);
    // Only the first vote should have been tallied.
    expect(sim.state.yesVotes).toBe(1);
    expect(sim.state.noVotes).toBe(0);
  });

  it('produces different nullifiers for different voters', async () => {
    const sim = new VotingSimulator('election-h');
    sim.openElection();
    const a = await sim.castVote('voter-1', 'YES');
    const b = await sim.castVote('voter-2', 'YES');
    expect(a.nullifier).toBeDefined();
    expect(b.nullifier).toBeDefined();
    expect(a.nullifier).not.toBe(b.nullifier);
  });

  it('rejects votes cast after the election is closed', async () => {
    const sim = new VotingSimulator('election-i');
    sim.openElection();
    await sim.castVote('voter-x', 'YES');
    sim.closeElection();
    const result = await sim.castVote('voter-y', 'NO');
    expect(result.ok).toBe(false);
    expect(sim.state.status).toBe('CLOSED');
  });

  it('computeResult reflects the winning side only once closed', async () => {
    const sim = new VotingSimulator('election-j');
    sim.openElection();
    await sim.castVote('v1', 'YES');
    await sim.castVote('v2', 'YES');
    await sim.castVote('v3', 'NO');

    expect(computeResult(sim.state)).toBe('PENDING');
    sim.closeElection();
    expect(computeResult(sim.state)).toBe('YES');
    expect(turnout(sim.state)).toBe(3);
  });

  it('computeResult reports a TIE when tallies match', async () => {
    const sim = new VotingSimulator('election-k');
    sim.openElection();
    await sim.castVote('v1', 'YES');
    await sim.castVote('v2', 'NO');
    sim.closeElection();
    expect(computeResult(sim.state)).toBe('TIE');
  });

  it('hasNullifierVoted mirrors the read-only hasVoted circuit', async () => {
    const sim = new VotingSimulator('election-l');
    sim.openElection();
    const { nullifier } = await sim.castVote('voter-z', 'YES');
    expect(sim.hasNullifierVoted(nullifier!)).toBe(true);
    expect(sim.hasNullifierVoted('never-used-nullifier')).toBe(false);
  });
});
