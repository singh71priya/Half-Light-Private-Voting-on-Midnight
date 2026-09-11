import { useElection } from './hooks/useElection';
import { StatusBadge } from './components/StatusBadge';
import { TallyChart } from './components/TallyChart';
import { BallotForm } from './components/BallotForm';
import { NullifierLedger } from './components/NullifierLedger';
import { PrivacyPanel } from './components/PrivacyPanel';
import { AdminControls } from './components/AdminControls';
import { DEMO_MODE } from './lib/midnightClient';
import type { ElectionMeta } from './lib/types';

const ELECTION: ElectionMeta = {
  id: 'first-quarter-proposal-01',
  title: 'Should the treasury fund the Q2 community grants round?',
  description:
    'A single anonymous ballot per device key. Your choice is never linked to your wallet — only the running tally changes on-chain.',
  yesLabel: 'Yes, fund it',
  noLabel: 'No, hold off',
};

export default function App() {
  const { state, loading, error, hasVoted, myNullifier, castVote, openElection, closeElection } =
    useElection(ELECTION.id);

  return (
    <div className="min-h-screen bg-midnight-950 bg-moon-gradient font-body text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <MoonMark />
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Half Light</p>
              <p className="text-xs text-white/40">Private Voting on Midnight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {DEMO_MODE && (
              <span className="rounded-full border border-moonlight-400/30 bg-moonlight-400/10 px-3 py-1 text-xs font-medium text-moonlight-300">
                Demo mode
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              🌗 Level 3 · First Quarter
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="mb-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            {state && <StatusBadge status={state.status} />}
            <span className="text-xs text-white/30">Election ID: {ELECTION.id}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{ELECTION.title}</h1>
        </section>

        {loading && <p className="text-white/50">Loading election state…</p>}
        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {state && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-6">
              <BallotForm meta={ELECTION} status={state.status} hasVoted={hasVoted} onVote={castVote} />
              <TallyChart meta={ELECTION} state={state} />
              <PrivacyPanel />
            </div>
            <div className="space-y-6">
              <NullifierLedger nullifiers={state.nullifiers} myNullifier={myNullifier} />
              <AdminControls status={state.status} onOpen={openElection} onClose={closeElection} />
            </div>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-center text-xs text-white/30">
        Built for the Midnight Builder Challenge — Level 3 · Contract: private-voting.compact
      </footer>
    </div>
  );
}

function MoonMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14V2z"
        fill="#B9A9FF"
        opacity="0.9"
      />
      <circle cx="16" cy="16" r="14" stroke="#B9A9FF" strokeOpacity="0.35" />
    </svg>
  );
}
