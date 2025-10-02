use bs58;
use std::io::{self, BufRead};

fn base58_to_wallet() {
println!("Input your private key as a base58 string:");
let stdin = io::stdin();
let base58 = stdin.lock().lines().next().unwrap().unwrap();
println!("Your wallet file format is:");
let wallet = bs58::decode(base58).into_vec().unwrap();
println!("{:?}", wallet);
}

fn main(){
    base58_to_wallet();
}