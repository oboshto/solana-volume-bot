import * as dotenv from "dotenv";
import { Keypair, PublicKey } from "@solana/web3.js";
import { utils } from "@coral-xyz/anchor";

dotenv.config();

export interface BotConfig {
  privateKey: Keypair;
  buyAmountInSol: number;
  slippagePercentage: number;
  tokenMint: PublicKey;
  rpcUrl: string;
  priorityFeeSol: number;
  transactionIntervalSeconds: number;
}

export const loadConfig = (): BotConfig => {
  const privateKeyStr = process.env.PRIVATE_KEY;
  const buyAmountInSolStr = process.env.BUY_AMOUNT_IN_SOL;
  const slippagePercentageStr = process.env.SLIPPAGE_PERCENTAGE;
  const tokenMintStr = process.env.TOKEN_MINT;
  const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
  const priorityFeeSolStr = process.env.PRIORITY_FEE_SOL || "0";
  const transactionIntervalSecondsStr =
    process.env.TRANSACTION_INTERVAL_SECONDS || "0";

  if (!privateKeyStr) {
    throw new Error("PRIVATE_KEY is required in .env file");
  }

  if (!buyAmountInSolStr) {
    throw new Error("BUY_AMOUNT_IN_SOL is required in .env file");
  }

  if (!slippagePercentageStr) {
    throw new Error("SLIPPAGE_PERCENTAGE is required in .env file");
  }

  if (!tokenMintStr) {
    throw new Error("TOKEN_MINT is required in .env file");
  }

  const privateKey = Keypair.fromSecretKey(
    utils.bytes.bs58.decode(privateKeyStr)
  );
  const buyAmountInSol = parseFloat(buyAmountInSolStr);
  const slippagePercentage = parseFloat(slippagePercentageStr);
  const tokenMint = new PublicKey(tokenMintStr);
  const priorityFeeSol = parseFloat(priorityFeeSolStr);
  const transactionIntervalSeconds = parseInt(
    transactionIntervalSecondsStr,
    10
  );

  if (isNaN(buyAmountInSol) || buyAmountInSol <= 0) {
    throw new Error("BUY_AMOUNT_IN_SOL must be a positive number");
  }

  if (
    isNaN(slippagePercentage) ||
    slippagePercentage < 0 ||
    slippagePercentage > 100
  ) {
    throw new Error("SLIPPAGE_PERCENTAGE must be a number between 0 and 100");
  }

  if (isNaN(priorityFeeSol) || priorityFeeSol < 0) {
    throw new Error("PRIORITY_FEE_SOL must be a non-negative number");
  }

  if (isNaN(transactionIntervalSeconds) || transactionIntervalSeconds < 0) {
    throw new Error(
      "TRANSACTION_INTERVAL_SECONDS must be a non-negative number"
    );
  }

  return {
    privateKey,
    buyAmountInSol,
    slippagePercentage,
    tokenMint,
    rpcUrl,
    priorityFeeSol,
    transactionIntervalSeconds,
  };
};
