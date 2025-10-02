import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  addSignersToTransactionMessage,
  getProgramDerivedAddress,
  generateKeyPairSigner,
  getAddressEncoder,
} from "@solana/kit";

import wallet from "./Turbin3-wallet.json";

import {
  getInitializeInstruction,
  getSubmitTsInstruction,
  getUpdateInstruction,
} from "./clients/js/src/generated";

const MPL_CORE_PROGRAM = address(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
);
const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("wss://api.devnet.solana.com")
);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

const addressEncoder = getAddressEncoder();
const accountSeeds = [
  Buffer.from("prereqs"),
  addressEncoder.encode(keypair.address),
];
const COLLECTION = address("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

const [account, _bump] = await getProgramDerivedAddress({
  programAddress: PROGRAM_ADDRESS,
  seeds: accountSeeds,
});
const mintKeyPair = await generateKeyPairSigner();

//
// Step 1 - Initialize
//
// const [account, _bump] = await getProgramDerivedAddress({
// //   programAddress: PROGRAM_ADDRESS,
// //   seeds: accountSeeds,
// // });
// const initializeIx = getInitializeInstruction({
//   github: "harshitneversettle",
//   user: keypair,
//   account,
//   systemProgram: SYSTEM_PROGRAM,
// });

// const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
// const transactionMessageInit = pipe(
//   createTransactionMessage({ version: 0 }),
//   (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
//   (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
//   (tx) => appendTransactionMessageInstructions([initializeIx], tx)
// );
// const signedTxInit = await signTransactionMessageWithSigners(
//   transactionMessageInit
// );
// assertIsTransactionWithinSizeLimit(signedTxInit);
// try {
//   console.log("hello") ;
//   await sendAndConfirmTransaction(signedTxInit, {
//     commitment: "confirmed",
//     skipPreflight: false,
//   });
//   const signatureInit = getSignatureFromTransaction(signedTxInit);
//   console.log(`✅ Initialize TX: https://explorer.solana.com/tx/${signatureInit}?cluster=devnet`);
// } catch (e) {
//   console.error(`Oops, initialize failed: ${e}`);
// }

// step 2 - Submit TS
// Execute the submitTs transaction

const [authority] = await getProgramDerivedAddress({
  programAddress: PROGRAM_ADDRESS,
  seeds: [Buffer.from("collection"), addressEncoder.encode(COLLECTION)],
});
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const submitIx = getSubmitTsInstruction({
  user: keypair,
  account,
  mint: mintKeyPair,
  collection: COLLECTION,
  authority,
  mplCoreProgram: MPL_CORE_PROGRAM,
  systemProgram: SYSTEM_PROGRAM,
});
const transactionMessageSubmit = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([submitIx], tx),
  (tx) => addSignersToTransactionMessage([mintKeyPair], tx) // Add mint as additional signer after appending instructions
);
const signedTxSubmit = await signTransactionMessageWithSigners(
  transactionMessageSubmit
);
assertIsTransactionWithinSizeLimit(signedTxSubmit);
try {
  await sendAndConfirmTransaction(signedTxSubmit, {
    commitment: "confirmed",
    skipPreflight: false,
  });
  const signatureSubmit = getSignatureFromTransaction(signedTxSubmit);
  console.log(`Success! Check out your TX here:
https://explorer.solana.com/tx/${signatureSubmit}?cluster=devnet`);
} catch (e) {
  console.error(`Oops, something went wrong: ${e}`);
}
