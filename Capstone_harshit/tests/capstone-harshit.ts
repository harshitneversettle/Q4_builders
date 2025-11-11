// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { CapstoneHarshit } from "../target/types/capstone_harshit";
// import {
//   PublicKey,
//   SystemProgram,
//   Keypair,
//   Transaction,
//   LAMPORTS_PER_SOL,
//   sendAndConfirmTransaction,
// } from "@solana/web3.js";

// import {
//   getAccount,
//   getOrCreateAssociatedTokenAccount,
//   createSyncNativeInstruction,
//   createTransferInstruction,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// import fs from "fs";

// // -------------------------------------------------------------
// // Load Keypairs
// // -------------------------------------------------------------

// const HARSHIT_KEYPAIR = Keypair.fromSecretKey(
//   Uint8Array.from(
//     JSON.parse(
//       fs.readFileSync(
//         "/home/titan/Desktop/capstone-harshit/harshit.json",
//         "utf-8"
//       )
//     )
//   )
// );

// const TEST_KEYPAIR = Keypair.fromSecretKey(
//   Uint8Array.from(
//     JSON.parse(
//       fs.readFileSync(
//         "/home/titan/Desktop/capstone-harshit/Test.json",
//         "utf-8"
//       )
//     )
//   )
// );

// console.log("Loaded Harshit wallet:", HARSHIT_KEYPAIR.publicKey.toBase58());
// console.log("Loaded Test wallet:", TEST_KEYPAIR.publicKey.toBase58());

// // -------------------------------------------------------------
// // Test Suite
// // -------------------------------------------------------------

// describe("Initialize Treasury + Deposit", () => {
//   const connection = new anchor.web3.Connection(
//     "http://127.0.0.1:8899",
//     "confirmed"
//   );

//   const provider = new anchor.AnchorProvider(
//     connection,
//     new anchor.Wallet(HARSHIT_KEYPAIR),
//     {}
//   );

//   anchor.setProvider(provider);

//   const program = anchor.workspace
//     .CapstoneHarshit as Program<CapstoneHarshit>;

//   let liquidityMint: PublicKey;
//   let treasuryStatePda: PublicKey;
//   let treasuryVaultAta: PublicKey;
//   let treasuryBump: number;

//   // -------------------------------------------------------------
//   // Step 0: Setup & Initialize Treasury
//   // -------------------------------------------------------------

//   before(async () => {
//     [treasuryStatePda, treasuryBump] = PublicKey.findProgramAddressSync(
//       [Buffer.from("treasury")],
//       program.programId
//     );

//     console.log("Treasury PDA:", treasuryStatePda.toBase58());

//     try {
//       const treasury = await program.account.treasuryState.fetch(
//         treasuryStatePda
//       );

//       console.log("Treasury already exists. Loading...");

//       liquidityMint = treasury.liquidityMint;
//       treasuryVaultAta = treasury.treasuryAta;
//     } catch (_) {
//       console.log("Treasury not found. Initializing...");

//       // WSOL Mint
//       liquidityMint = new PublicKey(
//         "So11111111111111111111111111111111111111112"
//       );

//       // Create Treasury Vault ATA
//       const vault = await getOrCreateAssociatedTokenAccount(
//         connection,
//         HARSHIT_KEYPAIR,
//         liquidityMint,
//         treasuryStatePda,
//         true
//       );

//       treasuryVaultAta = vault.address;

//       // Initialize Treasury On-Chain
//       await program.methods
//         .initializeTreasury()
//         .accounts({
//           treasuryState: treasuryStatePda,
//           owner: HARSHIT_KEYPAIR.publicKey,
//           treasuryVault: treasuryVaultAta,
//           liquidityMint,
//           systemProgram: SystemProgram.programId,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .signers([HARSHIT_KEYPAIR])
//         .rpc();

//       console.log("Treasury initialized successfully.");
//     }

//     console.log("Liquidity Mint:", liquidityMint.toBase58());
//     console.log("Treasury Vault ATA:", treasuryVaultAta.toBase58());
//   });

//   // -------------------------------------------------------------
//   // Step 1: Deposit Test
//   // -------------------------------------------------------------

  
// it("Depositor deposits liquidity", async () => {
//   const amount = 10 ;

//   console.log("-------------------------------------------------");
//   console.log(`Depositing ${amount} SOL from test wallet`);
//   console.log("-------------------------------------------------");

//   // Create/Fetch User’s WSOL ATA
//   const userATA = await getOrCreateAssociatedTokenAccount(
//     connection,
//     TEST_KEYPAIR,
//     liquidityMint,
//     TEST_KEYPAIR.publicKey
//   );

//   const testATA = userATA.address;

//   const beforeBalance = (await getAccount(connection, testATA)).amount;
//   console.log("User WSOL balance before wrapping:", beforeBalance.toString());

//   // Step 1: Send SOL → ATA
//   const ix1 = SystemProgram.transfer({
//     fromPubkey: TEST_KEYPAIR.publicKey,
//     toPubkey: testATA,
//     lamports: amount * LAMPORTS_PER_SOL,
//   });

//   // Step 2: Sync WSOL (wrap)
//   const ix2 = createSyncNativeInstruction(testATA);

//   const tx = new Transaction().add(ix1, ix2);
//   await sendAndConfirmTransaction(connection, tx, [TEST_KEYPAIR]);

//   console.log(`Successfully wrapped ${amount} SOL into WSOL`);

//   const balanceAfterWrap = (await getAccount(connection, testATA)).amount;
//   console.log("User WSOL balance after wrapping:", Number(balanceAfterWrap)/ 1e9);


//   await program.methods
//     .depositTreasury(new anchor.BN(balanceAfterWrap)) 
//     .accounts({
//       treasuryState: treasuryStatePda,
//       user: TEST_KEYPAIR.publicKey,
//       userAta: testATA,
//       treasuryAta: treasuryVaultAta,
//       liquidityMint,
//       systemProgram: SystemProgram.programId,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//     })
//     .signers([TEST_KEYPAIR])
//     .rpc();

//   // Fetch treasury account state from the program
//   const treasuryState = await program.account.treasuryState.fetch(
//     treasuryStatePda
//   );

//   console.log("-------------------------------------------------");
//   console.log("Treasury state after deposit:");
//   console.log("Liquidity Mint:", treasuryState.liquidityMint.toBase58());
//   console.log("Treasury Vault ATA:", treasuryState.treasuryAta.toBase58());
//   console.log("Total Liquidity:", Number(treasuryState.totalLiquidity) / 1e9);
//   console.log("Total Borrowed:", Number(treasuryState.totalBorrowed)/1e9);
//   console.log("-------------------------------------------------");

  

//   return;
// });
// });




//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CapstoneHarshit } from "../target/types/capstone_harshit";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import fs from "fs";
import { expect } from "chai";

const HARSHIT_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("/home/titan/Desktop/capstone-harshit/harshit.json", "utf-8")))
);

const TEST_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("/home/titan/Desktop/capstone-harshit/Test.json", "utf-8")))
);

console.log("\nLoaded Wallets:");
console.log("  Harshit Wallet:", HARSHIT_KEYPAIR.publicKey.toBase58());
console.log("  Test Wallet   :", TEST_KEYPAIR.publicKey.toBase58());
console.log("-----------------------------------------------------");

describe("Lending Flow (Initialize Pool → Deposit → Borrow)", () => {
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(HARSHIT_KEYPAIR), {});
  anchor.setProvider(provider);

  const program = anchor.workspace.CapstoneHarshit as Program<CapstoneHarshit>;

  let collateralMint: PublicKey;
  let loanMint: PublicKey;
  let poolPda: PublicKey;
  let poolBump: number;
  let treasuryPda: PublicKey;
  let treasuryVaultAta: PublicKey;

  before(async () => {
    console.log("\nChecking Sol balances...");
    console.log("  Harshit Balance  :", (await connection.getBalance(HARSHIT_KEYPAIR.publicKey)) / LAMPORTS_PER_SOL);
    console.log("  Test Balance     :", (await connection.getBalance(TEST_KEYPAIR.publicKey)) / LAMPORTS_PER_SOL);
    console.log("-----------------------------------------------------");

    [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("treasury")], program.programId);
    [poolPda, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-pool"), TEST_KEYPAIR.publicKey.toBuffer()],
      program.programId
    );

    console.log("Treasury PDA :", treasuryPda.toBase58());
    console.log("Pool PDA     :", poolPda.toBase58());
    console.log("-----------------------------------------------------");

    try {
      const treasury = await program.account.treasuryState.fetch(treasuryPda);
      loanMint = treasury.liquidityMint;
      treasuryVaultAta = treasury.treasuryAta;

      console.log("Treasury Found:");
      console.log("  Liquidity Mint   :", loanMint.toBase58());
      console.log("  Treasury Vault   :", treasuryVaultAta.toBase58());
    } catch (_) {
      console.log("Treasury not initialized. Cannot continue.");
      throw new Error("Run initializeTreasury first.");
    }

    try {
      const poolState = await program.account.poolState.fetch(poolPda);
      collateralMint = poolState.collateralMint;

      console.log("Pool Found:");
      console.log("  Collateral Mint  :", collateralMint.toBase58());
    } catch (_) {
      console.log("No existing pool found. Creating collateral mint...");
      collateralMint = await createMint(
        connection,
        HARSHIT_KEYPAIR,
        HARSHIT_KEYPAIR.publicKey,
        HARSHIT_KEYPAIR.publicKey,
        6
      );
      console.log("Created Collateral Mint:", collateralMint.toBase58());
    }

    console.log("-----------------------------------------------------");
  });

  it("Initializes Pool (if missing)", async () => {
    try {
      await program.account.poolState.fetch(poolPda);
      console.log("Pool already exists. Skipping initialization.");
      return;
    } catch (_) {}

    console.log("Initializing new Pool...");

    const tx = await program.methods
      .initialize()
      .accounts({
        poolState: poolPda,
        owner: TEST_KEYPAIR.publicKey,
        collateralMint,
        loanMint,
        systemProgram: SystemProgram.programId,
      })
      .signers([TEST_KEYPAIR])
      .rpc();

    console.log("Pool Initialized.");
    console.log("Transaction Signature:", tx);
    console.log("-----------------------------------------------------");
  });

  it("Deposits collateral into the Pool", async () => {
    const depositAmount = 150;

    console.log("\nStarting collateral deposit...");
    console.log("  Minting", depositAmount, "collateral tokens to user");

    const userCollateralAta = await getOrCreateAssociatedTokenAccount(
      connection,
      HARSHIT_KEYPAIR,
      collateralMint,
      TEST_KEYPAIR.publicKey
    );

    console.log("  User Collateral ATA:", userCollateralAta.address.toBase58());

    await mintTo(
      connection,
      HARSHIT_KEYPAIR,
      collateralMint,
      userCollateralAta.address,
      HARSHIT_KEYPAIR.publicKey,
      depositAmount
    );

    const beforeBal = (await getAccount(connection, userCollateralAta.address)).amount;
    console.log("  Collateral Before Deposit:", Number(beforeBal));
    console.log("-----------------------------------------------------");

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), poolPda.toBuffer()],
      program.programId
    );

    const vaultAta = getAssociatedTokenAddressSync(collateralMint, vaultAuthority, true);

    console.log("  Vault Authority PDA:", vaultAuthority.toBase58());
    console.log("  Vault ATA          :", vaultAta.toBase58());

    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        poolState: poolPda,
        vaultAuthority,
        collateralMint,
        vaultAta,
        userAta: userCollateralAta.address,
        owner: TEST_KEYPAIR.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([TEST_KEYPAIR])
      .rpc();

    console.log("Collateral Deposit Transaction:", tx);

    const pool = await program.account.poolState.fetch(poolPda);
    const afterBal = (await getAccount(connection, vaultAta)).amount;

    console.log("\nDeposit Summary:");
    console.log("  Pool Collateral Stored:", pool.collateralAmount.toNumber());
    console.log("  Vault Balance After   :", Number(afterBal));
    console.log("-----------------------------------------------------");
  });

  it("Borrows from Treasury", async () => {
    console.log("\nStarting Borrow Process...");

    const treasuryBefore = (await getAccount(connection, treasuryVaultAta)).amount;
    console.log("  Treasury Vault ATA      :", treasuryVaultAta.toBase58());
    console.log("  Treasury Balance Before :", Number(treasuryBefore) / 1e9);

    const userLoanAta = await getOrCreateAssociatedTokenAccount(
      connection,
      TEST_KEYPAIR,
      loanMint,
      TEST_KEYPAIR.publicKey
    );

    const userBefore = (await getAccount(connection, userLoanAta.address)).amount;
    console.log("  User Loan ATA           :", userLoanAta.address.toBase58());
    console.log("  User Loan Before        :", Number(userBefore) / 1e9);
    console.log("-----------------------------------------------------");

    const tx = await program.methods
      .borrow()
      .accounts({
        poolState: poolPda,
        treasuryState: treasuryPda,
        loanMint,
        userAta: userLoanAta.address,
        owner: TEST_KEYPAIR.publicKey,
        treasuryAta: treasuryVaultAta,
        treasuryAuthority: treasuryPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([TEST_KEYPAIR])
      .rpc();

    console.log("Borrow Transaction Signature:", tx);

    const treasuryAfter = (await getAccount(connection, treasuryVaultAta)).amount;
    const userAfter = (await getAccount(connection, userLoanAta.address)).amount;

    console.log("Borrow Summary:");
    console.log("  Treasury After :", Number(treasuryAfter)/1e9);
    console.log("  User After     :", Number(userAfter) / 1e9);
    console.log("  Treasury Change:", Number(treasuryBefore - treasuryAfter) / 1e9);
    console.log("  User Change    :", Number(userAfter - userBefore) / 1e9);
    console.log("-----------------------------------------------------");

    expect(Number(userAfter)).to.be.greaterThan(Number(userBefore));
  });
});


