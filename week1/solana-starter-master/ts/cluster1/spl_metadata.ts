import wallet from "../../turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("8kNUfLwahsjQLfSc4LZW3qCXxjw6sk4jnsfz34cmz4Rg");
// Create a UMI connection
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));
const metadata = findMetadataPda(umi, { mint });

(async () => {
  try {
    // Start here
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      metadata,
      mint,
      mintAuthority: signer, // here harshit is the signer
      updateAuthority: signer, // here too harshit is the signer
      payer: signer, // payer is also harshit
    };
    let data: DataV2Args = {
      name: "Titan",
      symbol: "TNT",
      uri: "https://raw.githubusercontent.com/harshitneversettle/Rust_basics/main/uri.json",
      sellerFeeBasisPoints: 100,     // This field defines the royalty fee percentage that the original creators receive whenever the NFT is resold on secondary marketplaces
      creators: [
        // creaters me jitne me bhi keys hongi , spki royality ka sum 100 hona chaiye , because royality cant exceed 100%
        // creators array is used to list all people or wallets who should receive royalties when the NFT is sold on a secondary market.
        {
          address: signer.publicKey, // creaters wallet address
          verified: true, // Has this creator verified this metadata?
          share: 100, // percentage share of the total royality
        },
      ],
      collection: null,
      uses: null,
    };
    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };
    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });
    let result = await tx.sendAndConfirm(umi);
    console.log(bs58.encode(result.signature));
    // console.log(accounts) ;
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
