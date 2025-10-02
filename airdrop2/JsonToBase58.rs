use std::io::{self, BufRead};

fn wallet_to_base58() {
    println!("Input your private key as a JSON byte array (e.g. [12,34,...]):");

    let stdin = io::stdin();
    let input = stdin.lock().lines().next().unwrap().unwrap();

    let wallet = input
        .trim_start_matches('[')
        .trim_end_matches(']')
        .split(',')
        .map(|s| s.trim().parse::<u8>().unwrap())
        .collect::<Vec<u8>>();

    let base58 = bs58::encode(wallet).into_string();
    println!("Your Base58-encoded private key is:\n{}", base58);
}

fn main() {
    wallet_to_base58();
}
