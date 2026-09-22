const VISIBLE = [
  'Election metadata hash, lifecycle status (created / open / closed)',
  'The running yes/no tally after every vote',
  'The set of nullifiers already used (proves "no double voting" is being enforced)',
  'That a valid ballot was submitted by someone holding a fresh, unused secret',
];

const HIDDEN = [
  'Which wallet or person cast any specific ballot',
  'How any individual voted (yes or no)',
  "A voter's device secret key — it never leaves the browser except as a one-way hash",
  'Any link between two ballots from the same person across separate elections',
];

export function PrivacyPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-moonlight-300">
        Privacy model — half light, half shadow
      </h3>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-gold">
            <span className="h-2 w-2 rounded-full bg-accent-gold" /> What any observer can see
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            {VISIBLE.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 text-accent-gold">◐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-moonlight-300">
            <span className="h-2 w-2 rounded-full bg-moonlight-400" /> What stays private, always
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            {HIDDEN.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 text-moonlight-400">◑</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
