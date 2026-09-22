# Half Light - Private Voting on Midnight

![CI](https://github.com/singh71priya/Half-Light-Private-Voting-on-Midnight/actions/workflows/ci.yml/badge.svg)

> A decentralized, privacy-preserving governance platform built on the Midnight Network.

## Live Demo
https://half-light-private-voting-on-midnig.vercel.app/

## Demo Video
🎥 [Watch the 1-Minute Walkthrough Video (Google Drive)](https://drive.google.com/file/d/11MNbJvkCL1UbieQZ1uxAZYR0mx3k7JFq/view?usp=sharing)

## Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2` |

- 🔍 **Contract on Midnight Explorer:** [View Preprod Contract](https://preprod.midnightexplorer.com/contracts/0x937568119b1e0345b11463d01feee6d69c5c9a223b01afd103a7c8f0d20b96c2)
- ⚡ **Confirmed On-Chain Transaction:** [View Extrinsic on 1AM Explorer](https://explorer.1am.xyz/tx/0x28ec62e8f29c3a2dea4e79af7930318ea86658f4fa4f37567512eac1a875bcf7?network=preprod)

## Screenshots

**Product UI:**
![Product UI](screenshots/product%20ui.png)

**Contract Address Verification:**
![Contract Address](screenshots/contract%20address.png)

**Test Output:**
![Test Output](screenshots/test%20output.png)

## What This Does
Half Light is a fully private on-chain voting application. It allows authorized participants to cast votes on proposals without revealing their choices to the public ledger. The system uses zero-knowledge proofs to guarantee the integrity of the election: only valid voters can vote, double-voting is prevented, and the final tally accurately reflects the cast votes, all while keeping individual voter choices completely confidential.

## Privacy Model
- **PUBLIC:** The existence of the election, the contract address, the total yes/no tallies, the total turnout, and the list of nullifiers (which prevent double voting).
- **PRIVATE:** The voter's identity (secret key) and the voter's specific choice (YES or NO) for any given ballot.
- **PROVED without revealing:** The voter proves they possess a valid, authorized secret key and that they haven't voted yet (by generating a unique nullifier), and they update the correct public tally based on their private choice, all without ever revealing the secret key or the choice itself to the network.

## Privacy Claim
An on-chain observer analyzing the ledger can see that transactions are occurring and can observe the aggregate YES/NO tallies updating over time. They can also see unique nullifiers being appended to the state. However, the observer **cannot** link any specific nullifier or transaction to a particular voter, nor can they determine whether a specific transaction was a YES or NO vote. The anonymity set encompasses all authorized voters, ensuring complete ballot secrecy.

## Tech Stack
- **Smart Contract:** Compact (Midnight's ZK-focused language)
- **Frontend Framework:** React 18, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Blockchain Integration:** `@midnight-ntwrk/midnight-js-contracts` and related SDKs (v4.1.1)
- **Tooling:** TypeScript, Vitest

## Prerequisites
- Node.js (v20 or v22 recommended)
- `npm` package manager
- Midnight Lace Wallet (Lace 1AM) installed in your browser

## Setup & Run Locally

1. Clone the repository and install dependencies:
```bash
npm install
```

2. To run the frontend development server:
```bash
npm run dev --workspace frontend
```
The application will be available at `http://localhost:5173`.

## Run Tests
To execute the test suite (which covers circuit logic, state transitions, and privacy):
```bash
npm run test:ci --workspace frontend
```

## CI/CD
The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs automatically on every push and pull request. It executes the following steps:
1. **Contract Compilation**: Installs the Compact toolchain and compiles the smart contract to ensure there are no syntax or type errors in the ZK circuits.
2. **Frontend Validation**: Sets up Node.js, installs all dependencies, runs the ESLint linter, executes the full Vitest test suite, and finally builds the production bundle to verify that the application compiles without errors.

## Product Proposal
See PROPOSAL.md for details regarding the product use cases, data model, and feasibility for Mainnet.
