import { Keypair, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Jupiter } from "@jup-ag/core";
import * as bip39 from "bip39";
import { hdkey } from "@stablelib/ed25519";
import dotenv from "dotenv";

dotenv.config();

// derivación de tu wallet desde PHANTOM_MNEMONIC
const seed = await bip39.mnemonicToSeed(process.env.PHANTOM_MNEMONIC);
const master = hdkey.fromMasterSeed(seed).derivePath("m/44'/501'/0'/0'");
const wallet = Keypair.fromSecretKey(master.secretKey);

const connection = new Connection(process.env.RPC_URL, "confirmed");
const jup = await Jupiter.load({  
  connection,  
  cluster: "mainnet-beta",  
  user: wallet  
});

// swap de AMOUNT_USDC (en lamports) de USDC a SOL:
const routes = await jup.computeRoutes({
  inputMint: new PublicKey(process.env.USDC_MINT),
  outputMint: PublicKey.default, // So111… default
  amount: Number(process.env.AMOUNT_USDC),
  slippageBps: Number(process.env.SLIPPAGE_BPS),
});
if (!routes.routesInfos.length) {
  throw new Error("🚨 No hay rutas de swap");
}
const routeInfo = routes.routesInfos[0];
const swapResult = await jup.exchange({  
  routeInfo,  
  user: wallet  
});
console.log("🔊 Tx hash:", swapResult.swapTransaction);  
console.log(`📈 In:${process.env.AMOUNT_USDC} USDC → Out:${swapResult.outAmount} lamports SOL`);
