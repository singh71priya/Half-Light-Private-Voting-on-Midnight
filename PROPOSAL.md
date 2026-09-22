# Product Proposal

## What is the product, and who uses it?
Half Light is a fully private, decentralized voting and governance platform. It is designed for DAOs, corporate boards, community groups, and any organization that requires secure, verifiable elections where voter choices must remain strictly confidential. Users include election administrators (who open and close ballots) and authorized voters (who cast their votes using cryptographic secret keys).

## Why Midnight specifically?
Traditional transparent blockchains (like Ethereum or Cardano) record all transaction details publicly, meaning everyone can see exactly how a specific wallet voted. This lack of privacy makes transparent chains unsuitable for many real-world governance scenarios where ballot secrecy is legally or socially required (e.g., to prevent voter coercion or retaliation). 

Midnight solves this by providing native zero-knowledge smart contracts. Voters can generate client-side ZK proofs to verify they are authorized to vote and have not double-voted, while completely concealing their identity (secret key) and their specific choice (YES/NO) from the public ledger.

## Data Model
| Data Point       | Type           | Disclosed To |
|------------------|----------------|--------------|
| Election Status  | Public ledger  | Everyone     |
| Total YES/NO Tally| Public ledger | Everyone     |
| Spent Nullifiers | Public ledger  | Everyone     |
| Voter Secret Key | Private witness| No one (Client only) |
| Voter Choice (Yes/No)| Private witness| No one (Client only) |
| Vote Proof Data  | ZK Proof       | Verified by network, contents hidden |

## Mainnet Feasibility
Yes, this project is highly feasible for Mainnet deployment. The core cryptographic primitives (nullifiers for double-spend protection, persistent hashing for authorization, and private state transitions for tallying) are already functioning in the Preprod environment. The remaining steps for Mainnet involve finalizing the admin key management system, adding dynamic voter registration (e.g., Merkle tree-based whitelists instead of a single admin key), and conducting a thorough security audit of the Compact circuits. These improvements can realistically be completed by Level 6.
