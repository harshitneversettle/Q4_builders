Turbin3 Rust Prerequisites

This project is my Rust submission for the Turbin3 prerequisites.
It shows how to use Rust to interact with Solana Devnet and then submit proof on-chain that I’ve completed the coursework.
This project is my Rust submission for the Turbin3 prerequisites. It connects to Solana Devnet and shows three simple but important steps: claiming SOL into my wallet, sending a transfer to another account, and finally submitting proof on-chain by calling the submit_rs instruction from the Turbin3 program. Together, these steps demonstrate how to interact with Solana using Rust .

What’s inside
Airdrop → asks Devnet faucet for 2 SOL into my wallet.
Transfer → sends SOL from my dev wallet to my wallet which i have registered during application .
Submit RS → It calls the submit_rs instruction of the Turbin3 program on Devnet, proving on-chain that I finished the Rust prerequisites.

How to run
Install Rust and Cargo.
Clone this repo.
Add your Turbin3 wallet JSON file (dev-wallet.json or Turbin-wallet.json) to the project.

Run the tests:
cargo test test_claim_airdrop -- --nocapture   # claim SOL
cargo test test_transfer_sol -- --nocapture    # transfer SOL
cargo test test_submit_rs -- --nocapture  
