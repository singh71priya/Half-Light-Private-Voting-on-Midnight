import { useElection } from './hooks/useElection';
import { StatusBadge } from './components/StatusBadge';
import { TallyChart } from './components/TallyChart';
import { BallotForm } from './components/BallotForm';
import { NullifierLedger } from './components/NullifierLedger';
import { PrivacyPanel } from './components/PrivacyPanel';
import { AdminControls } from './components/AdminControls';
import { WalletConnectButton } from './components/WalletConnectButton';
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
  const { state, loading, error, lastMessage, hasVoted, myNullifier, lastTxId, lastExplorerUrl, castVote, openElection, closeElection } =
    useElection(ELECTION.id);

  return (
    <div className="min-h-screen bg-midnight-950 bg-moon-gradient font-body text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <MoonMark />
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Half Light</p>
              <p className="text-xs text-white/40">Private Voting on Midnight Preprod</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-moonlight-400/30 bg-moonlight-400/10 px-3 py-1 text-xs font-medium text-moonlight-300">
              Demo mode
            </span>
            <WalletConnectButton />
            <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              🌗 Level 3 · First Quarter
            </span>
          </div>
        </div>
      </header>

      {/* Network & Verifiable Contract Banner */}
      <div className="border-b border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs text-white/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Target Network: <strong className="text-white">Midnight Preprod</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-white/50">
              Contract:{' '}
              <a
                href="https://preprod.midnight.network/contract/937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2"
                target="_blank"
                rel="noreferrer"
                className="text-moonlight-300 underline decoration-moonlight-400/40 hover:text-white"
                title="View contract on Midnight Preprod Explorer"
              >
                93756811…0b96c2 ↗
              </a>
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            {state && <StatusBadge status={state.status} />}
            <span className="text-xs text-white/30">Election ID: {ELECTION.id}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{ELECTION.title}</h1>
        </section>

        {/* On-Chain Transaction Verification Card */}
        {lastTxId && (
          <div className="mb-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-emerald-200 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⛓️</span>
                <div>
                  <p className="font-semibold text-sm">On-Chain Transaction Confirmed on Midnight Preprod</p>
                  <p className="text-xs font-mono text-emerald-300/80">Tx ID: {lastTxId}</p>
                </div>
              </div>
              {lastExplorerUrl && (
                <a
                  href={lastExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-emerald-400/50 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-400/30"
                >
                  Verify on Explorer ↗
                </a>
              )}
            </div>
            {lastMessage && <p className="mt-2 text-xs text-emerald-300/70">{lastMessage}</p>}
          </div>
        )}

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
        Built for the Midnight Builder Challenge — Level 3 · Verifiable On-Chain on Midnight Preprod
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
