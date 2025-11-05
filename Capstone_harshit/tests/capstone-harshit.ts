import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CapstoneHarshit } from "../target/types/capstone_harshit";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("Initialize + Deposit Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CapstoneHarshit as Program<CapstoneHarshit>;
  const owner = provider.wallet as anchor.Wallet;

  let collateralMint: PublicKey;
  let loanMint: PublicKey;
  let userAta: PublicKey;
  let vaultAta: PublicKey;
  let poolPda: PublicKey;
  let bump: number;

  const depositAmount = 500_000; // 0.5 USDC

  it("✅ Initialize Pool", async () => {
    console.log("\n🚀 Pool Initialization\n");

    collateralMint = await createMint(
      provider.connection,
      owner.payer,
      owner.publicKey,
      owner.publicKey,
      6
    );

    loanMint = await createMint(
      provider.connection,
      owner.payer,
      owner.publicKey,
      owner.publicKey,
      9
    );

    // Create User ATA and Mint Tokens 🪙
    userAta = await createAssociatedTokenAccount(
      provider.connection,
      owner.payer,
      collateralMint,
      owner.publicKey
    );

    await mintTo(
      provider.connection,
      owner.payer,
      collateralMint,
      userAta,
      owner.publicKey,
      depositAmount * 10
    );

    [poolPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-pool"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        poolState: poolPda,
        owner: owner.publicKey,
        collateralMint,
        loanMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("✅ Deposit Collateral", async () => {
  console.log("\n💰 Running Deposit Test\n");

  const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), poolPda.toBuffer()],
    program.programId
  );

  vaultAta = getAssociatedTokenAddressSync(
    collateralMint,
    vaultAuthorityPda,
    true
  );

  console.log("🏦 Vault ATA:", vaultAta.toBase58());
  console.log("🔐 Vault Authority PDA:", vaultAuthorityPda.toBase58());

  await program.methods
    .deposit(new anchor.BN(depositAmount))
    .accounts({
      poolState: poolPda,
      vaultAuthority: vaultAuthorityPda,
      collateralMint,
      vaultAta,
      userAta,
      owner: owner.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  // ✅ Balance Check
  const vaultAcc = await getAccount(provider.connection, vaultAta);

  const poolState = await program.account.poolState.fetch(poolPda);

  console.log("\n📊 Deposit State Update:");
  console.log("---------------------------");
  console.log("📍 Pool PDA:           ", poolPda.toBase58());
  console.log("🏦 Vault ATA Balance:  ", Number(vaultAcc.amount));
  console.log("🪙 Collateral Amount:  ", poolState.collateralAmount.toNumber());
  console.log("👤 Owner:              ", poolState.owner.toBase58());
  console.log("🪙 Collateral Mint:    ", poolState.collateralMint.toBase58());
  console.log("Bump:                  ", poolState.bump);
  console.log("---------------------------\n");

  // ✅ Assertions
  expect(Number(vaultAcc.amount)).to.equal(depositAmount);
  expect(poolState.collateralAmount.toNumber()).to.equal(depositAmount);

  console.log("✅ Deposit Collateral Test ✅\n");
});

});