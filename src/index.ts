import { loadConfig } from "./config";
import {
  initializeSdk,
  createBuySellTransaction,
  executeBuySellTransaction,
} from "./bot";
import { logger } from "./logger";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const executeTradingCycle = async (
  config: ReturnType<typeof loadConfig>,
  transactionCount: number = 1
): Promise<number> => {
  try {
    const sdk = initializeSdk(config);

    const bondingCurve = await sdk.getBondingCurveAccount(config.tokenMint);
    if (!bondingCurve) {
      throw new Error(
        `No bonding curve found for token mint: ${config.tokenMint.toString()}`
      );
    }

    const transaction = await createBuySellTransaction(
      sdk,
      config.privateKey,
      config.tokenMint,
      config.buyAmountInSol,
      config.slippagePercentage,
      config.priorityFeeSol
    );

    const signature = await executeBuySellTransaction(
      sdk,
      config.privateKey,
      transaction
    );

    return config.buyAmountInSol * 2;
  } catch (error) {
    logger.error(error as Error);
    return 0;
  }
};

const main = async () => {
  try {
    logger.welcome();

    const config = loadConfig();
    logger.info(
      `Loaded configuration for token: ${config.tokenMint.toString()}`
    );
    logger.info(`Using wallet: ${config.privateKey.publicKey.toString()}`);
    logger.info(`Buy amount: ${config.buyAmountInSol} SOL`);
    logger.info(`Slippage percentage: ${config.slippagePercentage}%`);

    if (config.priorityFeeSol > 0) {
      logger.info(`Priority fee: ${config.priorityFeeSol} SOL`);
    }

    const { transactionIntervalSeconds } = config;

    logger.interval(transactionIntervalSeconds);

    if (transactionIntervalSeconds <= 0) {
      await executeTradingCycle(config);
      return;
    }

    let transactionCount = 0;
    let totalVolumeSol = 0;
    const startTime = Date.now();

    while (true) {
      transactionCount++;
      logger.info(`Starting transaction cycle ${transactionCount}`);

      const volumeInSol = await executeTradingCycle(config, transactionCount);
      totalVolumeSol += volumeInSol;

      const runningTimeSeconds = (Date.now() - startTime) / 1000;
      logger.stats({
        transactions: transactionCount,
        totalVolumeSol,
        runningTime: runningTimeSeconds,
      });

      logger.interval(transactionIntervalSeconds, transactionCount);

      await sleep(transactionIntervalSeconds * 1000);
    }
  } catch (error) {
    logger.error(error as Error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  logger.warning("Bot stopped by user. Exiting...");
  process.exit(0);
});

main().catch((error) => {
  logger.error(error as Error);
  process.exit(1);
});
