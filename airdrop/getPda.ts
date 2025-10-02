import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const USER = new PublicKey("9B9tXSndjpZxWazgibnfpuE5QoTjSx9sxtHRFBoHEyYm");

(async () => {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("prereqs"), USER.toBuffer()],
    PROGRAM_ID
  );

  console.log("PDA:", pda.toBase58());
  console.log("Bump:", bump);
})();
