use solana_client::{nonblocking::rpc_client, rpc_client::RpcClient};
use solana_program::{pubkey, instruction::{AccountMeta, Instruction}};
use solana_system_interface::instruction::transfer;
use solana_system_interface::program as system_program;


use std::str::FromStr;

use solana_sdk::{
    hash::hash, message::Message, pubkey::Pubkey, signature::{read_keypair_file, Keypair, Signer}, signer::keypair, transaction::Transaction
};

/// RPC endpoint for Solana devnet
const RPC_URL: &str = "https://api.devnet.solana.com";

/// Generate a new keypair
pub fn keygen() {
    let kp = Keypair::new();
    println!("You've generated a new Solana wallet: {}\n", kp.pubkey());
    println!("To save your wallet, copy and paste the following into a JSON file:");
    println!("{:?}", kp.to_bytes());
}

/// Claim 2 SOL from devnet faucet into dev-wallet.json
pub fn claim_airdrop() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
    let client = RpcClient::new(RPC_URL);

    match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
        Ok(sig) => {
            println!("Success! Check your TX here:");
            println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
        }
        Err(err) => {
            println!("Airdrop failed: {}", err);
        }
    }
}

/// Example: transfer SOL to your Turbin3 wallet
pub fn transfer_sol() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
    let rpc_client = RpcClient::new(RPC_URL);

    // Verify signature from keypair
    let pubkey = keypair.pubkey();
    let message_bytes = b"I verify my Solana Keypair!";
    let sig = keypair.sign_message(message_bytes);
    let sig_hashed = hash(sig.as_ref());

    match sig.verify(&pubkey.to_bytes(), &sig_hashed.to_bytes()) {
        true => println!("Signature verified"),
        false => println!("Signature failed"),
    }

    // Destination public key (Turbin3 wallet)
    let to_pubkey = Pubkey::from_str("9B9tXSndjpZxWazgibnfpuE5QoTjSx9sxtHRFBoHEyYm").unwrap();

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");

    let balance = rpc_client
        .get_balance(&keypair.pubkey())
        .expect("Failed to get balance");
    println!("Current balance: {} lamports", balance);
    let message = Message::new_with_blockhash(
        &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
        Some(&keypair.pubkey()),
        &recent_blockhash,
    );

    let message = Message::new_with_blockhash(
        &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
        Some(&keypair.pubkey()),
        &recent_blockhash,
    );

    let fee = rpc_client
        .get_fee_for_message(&message)
        .expect("Failed to get fee calculator");

    let transaction = Transaction::new_signed_with_payer(
        &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)], // 0.001 SOL
        Some(&keypair.pubkey()),
        &vec![&keypair],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send final transaction");
    println!(
        "Success! Entire balance transferred:
https://explorer.solana.com/tx/{}/?cluster=devnet",
        signature
    );

    let balance = rpc_client
        .get_balance(&keypair.pubkey())
        .expect("Failed to get balance");
    println!("New balance: {} lamports", balance);
}


// submit_rs

pub fn submit_rs() {
    let rpc_client = RpcClient::new(RPC_URL);
    let signer = read_keypair_file("Turbin-wallet.json").expect("Couldn't find wallet file");
    let mint = Keypair::new();
    let turbin3_prereq_program =
        Pubkey::from_str("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM").unwrap();

    let collection =
        Pubkey::from_str("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2").unwrap();

    let mpl_core_program =
        Pubkey::from_str("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d").unwrap();

    let system_program = system_program::id();
    let signer_pubkey = signer.pubkey();
    let seeds = &[b"prereqs", signer_pubkey.as_ref()];
    let (prereq_pda, _bump) = Pubkey::find_program_address(seeds, &turbin3_prereq_program);
    let data = vec![77, 124, 82, 163, 21, 133, 181, 206];
    let seeds = &[b"collection", collection.as_ref()];
    let (authority, _bump) = Pubkey::find_program_address(seeds, &turbin3_prereq_program);
    let accounts = vec![
        AccountMeta::new(signer.pubkey(), true),              // user signer
        AccountMeta::new(prereq_pda, false),                  // PDA account
        AccountMeta::new(mint.pubkey(), true),                // mint keypair
        AccountMeta::new(collection, false),                  // collection
        AccountMeta::new_readonly(authority, false),          // authority (PDA)
        AccountMeta::new_readonly(mpl_core_program, false),   // mpl core program
        AccountMeta::new_readonly(system_program, false),     // system program
    ];
    let blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");
    let instruction = Instruction {
        program_id: turbin3_prereq_program,
        accounts,
        data,
    };
    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&signer.pubkey()),
        &[&signer, &mint],
        blockhash,
    );
    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");
    println!(
        "Success! Check out your TX here:\nhttps://explorer.solana.com/tx/{}/?cluster=devnet", signature
    );
}


#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_keygen() {
    //     keygen();
    // }

    // #[test]
    // fn test_claim_airdrop() {
    //     claim_airdrop();
    // }

    // #[test]
    // fn test_transfer_sol() {
    //     transfer_sol();
    // }


    #[test]
    fn test_submit_rs() {
        submit_rs();
    }
}
