# managed/

This directory is where the Compact compiler writes its output when you run:

```bash
compact compile src/private-voting.compact managed/private-voting
```

It is intentionally left empty in version control (compiler artifacts are
generated, not authored) — CI regenerates it on every push. See
`.github/workflows/ci.yml` for the exact install + compile steps, and
`docs/PRIVACY_MODEL.md` / the root `README.md` for how these artifacts are
used by `frontend/src/lib/midnightClient.ts` once wired to a live network.
