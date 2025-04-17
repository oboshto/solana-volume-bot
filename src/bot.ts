import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { PumpFunSDK } from "pumpdotfun-sdk";
import { AnchorProvider, Provider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { BotConfig } from "./config";
import { logger } from "./logger";

const createProvider = (config: BotConfig): Provider => {
  const connection = new Connection(config.rpcUrl, "confirmed");
  const wallet = new NodeWallet(config.privateKey);
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
};

export const initializeSdk = (config: BotConfig): PumpFunSDK => {
  const provider = createProvider(config);
  return new PumpFunSDK(provider);
};

const calculateSlippageBasisPoints = (slippagePercentage: number): bigint => {
  return BigInt(Math.floor(slippagePercentage * 100));
};

const solToLamports = (sol: number): bigint => {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
};

const createComputeUnitPriceInstruction = (
  priorityFeeSol: number
): TransactionInstruction => {
  const microLamportsPerComputeUnit = Math.floor(
    priorityFeeSol * 5_000_000_000
  );

  const unitPrice = Math.max(1, microLamportsPerComputeUnit);

  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: unitPrice,
  });
};

const createComputeUnitLimitInstruction = (): TransactionInstruction => {
  const units = 200000;

  return ComputeBudgetProgram.setComputeUnitLimit({
    units,
  });
};

export const calculateExactTokenAmount = async (
  sdk: PumpFunSDK,
  tokenMint: PublicKey,
  solAmountInLamports: bigint
): Promise<{ tokenAmount: bigint; solCost: bigint }> => {
  try {
    const bondingCurveAccount = await sdk.getBondingCurveAccount(tokenMint);
    if (!bondingCurveAccount) {
      throw new Error(
        `Bonding curve not found for token: ${tokenMint.toString()}`
      );
    }

    const globalAccount = await sdk.getGlobalAccount();
    const feeBasisPoints = globalAccount.feeBasisPoints;

    const virtualSolReserves = bondingCurveAccount.virtualSolReserves;
    const virtualTokenReserves = bondingCurveAccount.virtualTokenReserves;

    const newSolReserves = virtualSolReserves + solAmountInLamports;

    const newTokenReserves =
      (virtualTokenReserves * virtualSolReserves) / newSolReserves;

    const rawTokenAmount = virtualTokenReserves - newTokenReserves;

    const fee = (rawTokenAmount * feeBasisPoints) / 10000n;
    const tokenAmount = rawTokenAmount - fee;

    const solCost = solAmountInLamports;

    return { tokenAmount, solCost };
  } catch (error) {
    logger.error(error as Error);
    throw error;
  }
};

export const createBuySellTransaction = async (
  sdk: PumpFunSDK,
  buyer: Keypair,
  tokenMint: PublicKey,
  buyAmountSol: number,
  slippagePercentage: number,
  priorityFeeSol: number = 0
): Promise<Transaction> => {
  try {
    const slippageBasisPoints =
      calculateSlippageBasisPoints(slippagePercentage);

    const buyAmountLamports = solToLamports(buyAmountSol);

    const { tokenAmount, solCost } = await calculateExactTokenAmount(
      sdk,
      tokenMint,
      buyAmountLamports
    );

    const slippageMultiplier = 10000n + slippageBasisPoints;
    const maxSolCost = (solCost * slippageMultiplier) / 10000n;

    logger.transaction("Creating buy/sell transaction");
    logger.tokenInfo({
      tokenAmount,
      solAmount: solCost,
      maxSolCost,
      slippage: `${slippageBasisPoints / 100n}%`,
    });

    if (priorityFeeSol > 0) {
      logger.info(`Using priority fee: ${priorityFeeSol} SOL`);
    }

    const globalAccount = await sdk.getGlobalAccount();
    const feeRecipient = globalAccount.feeRecipient;

    const buyTx = await sdk.getBuyInstructions(
      buyer.publicKey,
      tokenMint,
      feeRecipient,
      tokenAmount,
      maxSolCost
    );

    const sellTx = await sdk.getSellInstructionsByTokenAmount(
      buyer.publicKey,
      tokenMint,
      tokenAmount,
      0n
    );

    const transaction = new Transaction();

    if (priorityFeeSol > 0) {
      transaction.add(createComputeUnitLimitInstruction());
      transaction.add(createComputeUnitPriceInstruction(priorityFeeSol));
    }

    transaction.add(...buyTx.instructions);
    transaction.add(...sellTx.instructions);

    return transaction;
  } catch (error) {
    logger.error(error as Error);
    throw error;
  }
};

export const executeBuySellTransaction = async (
  sdk: PumpFunSDK,
  buyer: Keypair,
  transaction: Transaction
): Promise<string> => {
  try {
    const connection = sdk.connection;

    logger.transaction("Sending transaction...");

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [buyer],
      { commitment: "confirmed", skipPreflight: true }
    );

    logger.complete(signature);
    return signature;
  } catch (error) {
    logger.error(error as Error);
    throw error;
  }
};
