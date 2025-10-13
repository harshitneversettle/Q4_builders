import wallet from "../../turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz/" }));
umi.use(signerIdentity(signer));

//https://devnet.irys.xyz/

(async () => {
  try {
    //1. Load image
    const image = await readFile("./virat.png"); // the image will be in byte format i.e. the image will be not in the format that it accepts
    //console.log(image);
    //2. Convert image to generic file.
    const file = createGenericFile(image, "virat.png", {
      // it spits out the generic file
      contentType: "image/png",
    });
    //console.log(file) ;
    //3. Upload image
    // const image = ???
    const myUri = await umi.uploader.upload([file]);
    console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
