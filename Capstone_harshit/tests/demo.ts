// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { CapstoneHarshit } from "../target/types/capstone_harshit";
// import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
// import {
//   createMint,
//   mintTo,
//   getAccount,
//   getOrCreateAssociatedTokenAccount,
//   getAssociatedTokenAddressSync,
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// import fs from "fs";
// import { expect } from "chai";

// // -------------------------------------------------------------
// // Load Local Keypairs
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

//   const program = anchor.workspace.CapstoneHarshit as Program<CapstoneHarshit>;

//   let liquidityMint: PublicKey;
//   let treasuryStatePda: PublicKey;
//   let treasuryVaultAta: PublicKey;
//   let treasuryBump: number;

//   const TEST_DEPOSIT = 4 * 10 ** 9;

//   // -------------------------------------------------------------
//   // Step 0: Setup & Initialize Treasury
//   // -------------------------------------------------------------

//   before(async () => {

//     [treasuryStatePda, treasuryBump] =
//       PublicKey.findProgramAddressSync(
//         [Buffer.from("treasury")],
//         program.programId
//       );

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

//       liquidityMint = await createMint(
//         connection,
//         HARSHIT_KEYPAIR,
//         HARSHIT_KEYPAIR.publicKey,
//         HARSHIT_KEYPAIR.publicKey,
//         9
//       );

//       treasuryVaultAta = getAssociatedTokenAddressSync(
//         liquidityMint,
//         treasuryStatePda,
//         true
//       );

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

//   it("Depositor deposits liquidity", async () => {
//     const treasuryBefore = await program.account.treasuryState.fetch(
//       treasuryStatePda
//     );

//     console.log("Treasury liquidity before deposit:", treasuryBefore.totalLiquidity.toNumber() / 1e9);

//     const testAtaInfo = await getOrCreateAssociatedTokenAccount(
//       connection,
//       HARSHIT_KEYPAIR,
//       liquidityMint,
//       TEST_KEYPAIR.publicKey
//     );

//     const testAta = testAtaInfo.address;

//     await mintTo(
//       connection,
//       HARSHIT_KEYPAIR,
//       liquidityMint,
//       testAta,
//       HARSHIT_KEYPAIR.publicKey,
//       TEST_DEPOSIT
//     );

//     const balanceBefore = await getAccount(connection, testAta);

//     console.log("Minted tokens to Test's ATA:", Number(balanceBefore.amount) / 1e9);

//     const [userTreasuryPda] = PublicKey.findProgramAddressSync(
//       [Buffer.from("user-deposit"), TEST_KEYPAIR.publicKey.toBuffer()],
//       program.programId
//     );

//     console.log("User deposit PDA:", userTreasuryPda.toBase58());

//     const tx = await program.methods
//       .depositTreasury(new anchor.BN(TEST_DEPOSIT))
//       .accounts({
//         treasuryState: treasuryStatePda,
//         userTreasury: userTreasuryPda,
//         user: TEST_KEYPAIR.publicKey,
//         userAta: testAta,
//         liquidityMint,
//         treasuryAta: treasuryVaultAta,
//         systemProgram: SystemProgram.programId,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         owner: HARSHIT_KEYPAIR.publicKey,
//       })
//       .signers([TEST_KEYPAIR])
//       .rpc();

//     console.log("Deposit transaction signature:", tx);

//     const treasuryAfter = await program.account.treasuryState.fetch(
//       treasuryStatePda
//     );

//     const vaultAccount = await getAccount(connection, treasuryVaultAta);
//     const userTreasuryAccount = await program.account.userTreasury.fetch(
//       userTreasuryPda
//     );

//     console.log("Treasury liquidity after deposit:", treasuryAfter.totalLiquidity.toNumber() / 1e9);
//     console.log("Treasury vault token balance:", Number(vaultAccount.amount) / 1e9);

//     console.log("User deposit record:");
//     console.log("User:", userTreasuryAccount.user.toBase58());
//     console.log("Deposit amount:", userTreasuryAccount.depositAmount.toNumber() / 1e9);
//     console.log("Deposit time:", new Date(userTreasuryAccount.depositTime.toNumber() * 1000).toLocaleString());

//     expect(treasuryAfter.totalLiquidity.toNumber()).to.equal(
//       treasuryBefore.totalLiquidity.toNumber() + TEST_DEPOSIT
//     );

//     console.log("Deposit test passed.");
//   });
// });




// //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



// // import * as anchor from "@coral-xyz/anchor";
// // import { Program } from "@coral-xyz/anchor";
// // import { CapstoneHarshit } from "../target/types/capstone_harshit";
// // import readline from "readline"; // for input 
// // import {
// //   PublicKey,
// //   SystemProgram,
// //   Keypair,
// //   LAMPORTS_PER_SOL,
// // } from "@solana/web3.js";
// // import {
// //   createMint,
// //   getOrCreateAssociatedTokenAccount,
// //   mintTo,
// //   getAccount,
// //   getAssociatedTokenAddressSync,
// //   TOKEN_PROGRAM_ID,
// //   ASSOCIATED_TOKEN_PROGRAM_ID,
// // } from "@solana/spl-token";

// // import fs from "fs";
// // import { expect } from "chai";

// // // -------------------------------------------------------------
// // // Load Local Wallets
// // // -------------------------------------------------------------
// // const HARSHIT_KEYPAIR = Keypair.fromSecretKey(
// //   Uint8Array.from(JSON.parse(fs.readFileSync("/home/titan/Desktop/capstone-harshit/harshit.json", "utf-8")))
// // );

// // const TEST_KEYPAIR = Keypair.fromSecretKey(
// //   Uint8Array.from(JSON.parse(fs.readFileSync("/home/titan/Desktop/capstone-harshit/Test.json", "utf-8")))
// // );

// // console.log("Harshit Wallet:", HARSHIT_KEYPAIR.publicKey.toBase58());
// // console.log("Test User Wallet:", TEST_KEYPAIR.publicKey.toBase58());

// // // -------------------------------------------------------------
// // // Test Suite
// // // -------------------------------------------------------------
// // describe("Lending Flow (Initialize Pool -> Deposit -> Borrow)", () => {
// //   const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
// //   const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(HARSHIT_KEYPAIR), {});
// //   anchor.setProvider(provider);

// //   const program = anchor.workspace.CapstoneHarshit as Program<CapstoneHarshit>;

// //   let collateralMint: PublicKey;
// //   let loanMint: PublicKey;
// //   let poolPda: PublicKey;
// //   let poolBump: number;
// //   let treasuryPda: PublicKey;
// //   let treasuryVaultAta: PublicKey;

// //   // -------------------------------------------------------------
// //   // Step 1: Setup + Fetch Treasury + Fetch/Create Pool
// //   // -------------------------------------------------------------
// //   before(async () => {

// //     console.log("Harshit Balance:", await connection.getBalance(HARSHIT_KEYPAIR.publicKey) / LAMPORTS_PER_SOL, "SOL");
// //     console.log("Test Balance:", await connection.getBalance(TEST_KEYPAIR.publicKey) / LAMPORTS_PER_SOL, "SOL");

// //     [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("treasury")], program.programId);
// //     [poolPda, poolBump] = PublicKey.findProgramAddressSync(
// //       [Buffer.from("user-pool"), TEST_KEYPAIR.publicKey.toBuffer()],
// //       program.programId
// //     );

// //     console.log("Treasury PDA:", treasuryPda.toBase58());
// //     console.log("User Pool PDA:", poolPda.toBase58());

// //     // Try Existing Treasury
// //     try {
// //       const treasury = await program.account.treasuryState.fetch(treasuryPda);
// //       loanMint = treasury.liquidityMint;
// //       treasuryVaultAta = treasury.treasuryAta;

// //       console.log("Existing Treasury Found:");
// //       console.log("Loan Mint:", loanMint.toBase58());
// //       console.log("Treasury Vault ATA:", treasuryVaultAta.toBase58());
// //     } catch (_) {
// //       console.log("Treasury not found. Cannot proceed until treasury is initialized.");
// //       throw new Error("Treasury initialization required before running this suite.");
// //     }

// //     // Try Existing Pool
// //     try {
// //       const poolState = await program.account.poolState.fetch(poolPda);
// //       collateralMint = poolState.collateralMint;

// //       console.log("Existing Pool Found. Collateral Mint:", collateralMint.toBase58());
// //     } catch (_) {
// //       console.log("No existing pool found. Creating new collateral mint...");
// //       collateralMint = await createMint(
// //         connection,
// //         HARSHIT_KEYPAIR,
// //         HARSHIT_KEYPAIR.publicKey,
// //         HARSHIT_KEYPAIR.publicKey,
// //         6
// //       );
// //     }

// //     console.log("Collateral Mint:", collateralMint.toBase58());
// //   });

// //   // -------------------------------------------------------------
// //   // Step 2: Initialize Pool
// //   // -------------------------------------------------------------
// //   it("Initializes Pool for user if missing", async () => {
// //     try {
// //       await program.account.poolState.fetch(poolPda);
// //       console.log("Pool already exists. Skipping initialization.");
// //       return;
// //     } catch (_) {}

// //     console.log("Pool not found. Initializing...");

// //     const tx = await program.methods
// //       .initialize()
// //       .accounts({
// //         poolState: poolPda,
// //         owner: TEST_KEYPAIR.publicKey,    // pool state ka owner user hai 
// //         collateralMint,
// //         loanMint,
// //         systemProgram: SystemProgram.programId,
// //       })
// //       .signers([TEST_KEYPAIR])
// //       .rpc();

// //     console.log("Pool Initialized. Tx:", tx);
// //   });

// //   // -------------------------------------------------------------
// //   // Step 3: Deposit Collateral
// //   // -------------------------------------------------------------
// //   it("Deposits collateral into the pool", async () => {
// //     console.log("Enter the")
// //     const rl = readline.createInterface({
// //       input: process.stdin,
// //       output: process.stdout
// //     });
// //     let collateral_amount = 0 ;
// //     rl.question("Enter collateral amount: ", (answer) => {
// //       collateral_amount = Number(answer);
      
// //     console.log("You entered: ", collateral_amount);

// //     rl.close();
// //   });
// //   const depositAmount = collateral_amount ;
    
// //     const testAta = await getOrCreateAssociatedTokenAccount(
// //       connection,
// //       HARSHIT_KEYPAIR,
// //       collateralMint,
// //       TEST_KEYPAIR.publicKey
// //     );

// //     console.log("User Collateral ATA:", testAta.address.toBase58());

// //     await mintTo(
// //       connection,
// //       HARSHIT_KEYPAIR,
// //       collateralMint,
// //       testAta.address,
// //       HARSHIT_KEYPAIR.publicKey,
// //       depositAmount
// //     );

// //     const beforeBal = (await getAccount(connection, testAta.address)).amount;
// //     console.log("User ATA Balance Before:", Number(beforeBal) / 1e6);

// //     const [vaultAuthority] = PublicKey.findProgramAddressSync(
// //       [Buffer.from("vault"), poolPda.toBuffer()],
// //       program.programId
// //     );

// //     const vaultAta = getAssociatedTokenAddressSync(collateralMint, vaultAuthority, true);

// //     const tx = await program.methods
// //       .deposit(new anchor.BN(depositAmount))
// //       .accounts({
// //         poolState: poolPda,
// //         vaultAuthority,
// //         collateralMint,
// //         vaultAta,
// //         userAta: testAta.address,
// //         owner: TEST_KEYPAIR.publicKey,
// //         tokenProgram: TOKEN_PROGRAM_ID,
// //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
// //         systemProgram: SystemProgram.programId,
// //       })
// //       .signers([TEST_KEYPAIR])
// //       .rpc();

// //     console.log("Collateral Deposit Tx:", tx);

// //     const pool = await program.account.poolState.fetch(poolPda);
// //     const afterBal = (await getAccount(connection, vaultAta)).amount;

// //     console.log("Pool Collateral Amount:", pool.collateralAmount.toNumber());
// //     console.log("Vault Balance After:", Number(afterBal) / 1e6);
// //   });

// //   // -------------------------------------------------------------
// //   // Step 4: Borrow Loan
// //   // -------------------------------------------------------------
// //   it("Borrows from treasury", async () => {
// //     console.log("Starting Borrow Process...");

// //     console.log("Treasury Vault ATA:", treasuryVaultAta.toBase58());

// //     const treasuryBefore = (await getAccount(connection, treasuryVaultAta)).amount;
// //     console.log("Treasury Balance Before:", Number(treasuryBefore) / 1e9);

// //     const testLoanAta = await getOrCreateAssociatedTokenAccount(
// //       connection,
// //       HARSHIT_KEYPAIR,
// //       loanMint,
// //       TEST_KEYPAIR.publicKey
// //     );

// //     const userBefore = (await getAccount(connection, testLoanAta.address)).amount;
// //     console.log("User Loan ATA Before:", Number(userBefore) / 1e9);

// //     const tx = await program.methods
// //       .borrow()
// //       .accounts({
// //         poolState: poolPda,
// //         treasuryState: treasuryPda,
// //         loanMint,
// //         userAta: testLoanAta.address,
// //         owner: TEST_KEYPAIR.publicKey,
// //         treasuryAta: treasuryVaultAta,
// //         treasuryAuthority: treasuryPda,
// //         tokenProgram: TOKEN_PROGRAM_ID,
// //         systemProgram: SystemProgram.programId,
// //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
// //       })
// //       .signers([TEST_KEYPAIR])
// //       .rpc();

// //     console.log("Borrow Transaction:", tx);

// //     const treasuryAfter = (await getAccount(connection, treasuryVaultAta)).amount;
// //     const userAfter = (await getAccount(connection, testLoanAta.address)).amount;

// //     console.log("Treasury Balance After:", Number(treasuryAfter) / 1e9);
// //     console.log("User Loan ATA After:", Number(userAfter) / 1e9);
// //     console.log("Treasury Change:", (Number(treasuryBefore) - Number(treasuryAfter)) / 1e9);
// //     console.log("User Change:", (Number(userAfter) - Number(userBefore)) / 1e9);

// //     expect(Number(userAfter)).to.be.greaterThan(Number(userBefore));
// //   });
// // });
