import { shortHex } from '../lib/hash';

interface Props {
  nullifiers: string[];
  myNullifier: string | null;
}

export function NullifierLedger({ nullifiers, myNullifier }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-moonlight-300">
          Nullifier registry
        </h3>
        <span className="text-xs text-white/40">{nullifiers.length} entr{nullifiers.length === 1 ? 'y' : 'ies'}</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-white/40">
        Every ballot leaves exactly one entry here — a one-way hash that stops double-voting without ever
        linking back to a wallet or identity.
      </p>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1 font-mono text-xs">
        {nullifiers.length === 0 && <li className="text-white/30">No ballots cast yet.</li>}
        {nullifiers
          .slice()
          .reverse()
          .map((n) => (
            <li
              key={n}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${
                n === myNullifier ? 'bg-moonlight-400/10 text-moonlight-300 ring-1 ring-moonlight-400/30' : 'text-white/50'
              }`}
            >
              <span>{shortHex(n, 8)}</span>
              {n === myNullifier && <span className="text-[10px] uppercase tracking-wide">you</span>}
            </li>
          ))}
      </ul>
    </div>
  );
}
