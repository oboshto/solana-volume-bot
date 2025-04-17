import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version || "1.0.0";

const asciiArt = `
    ██╗ ██████╗ ██████╗     ███████╗ ██████╗ ██╗     
    ██║██╔═══██╗██╔══██╗    ██╔════╝██╔═══██╗██║     
    ██║██║   ██║██████╔╝    ███████╗██║   ██║██║     
██  ██║██║   ██║██╔═══╝     ╚════██║██║   ██║██║     
╚█████╔╚██████╔╝██║         ███████║╚██████╔╝███████╗
 ╚════╝ ╚═════╝ ╚═╝         ╚══════╝ ╚═════╝ ╚══════╝
                                                    
 ██╗   ██╗ ██████╗ ██╗     ██╗   ██╗███╗   ███╗███████╗    ██████╗  ██████╗ ████████╗
 ██║   ██║██╔═══██╗██║     ██║   ██║████╗ ████║██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
 ██║   ██║██║   ██║██║     ██║   ██║██╔████╔██║█████╗      ██████╔╝██║   ██║   ██║   
 ╚██╗ ██╔╝██║   ██║██║     ██║   ██║██║╚██╔╝██║██╔══╝      ██╔══██╗██║   ██║   ██║   
  ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝██║ ╚═╝ ██║███████╗    ██████╔╝╚██████╔╝   ██║   
   ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝    ╚═════╝  ╚═════╝    ╚═╝   
                                                                            
                                                                    v${version}
`;

export const logger = {
  welcome: () => {
    console.log(chalk.cyan(asciiArt));
    console.log(
      chalk.yellow(
        "================================================================"
      )
    );
    console.log(chalk.green("  Welcome to JOP SOL VOLUME BOT!"));
    console.log(
      chalk.yellow(
        "================================================================\n"
      )
    );
  },

  info: (message: string) => {
    console.log(chalk.blue("ℹ️ INFO: ") + message);
  },

  success: (message: string) => {
    console.log(chalk.green("✅ SUCCESS: ") + message);
  },

  error: (message: string | Error) => {
    const errorMessage = message instanceof Error ? message.message : message;
    console.error(chalk.red("❌ ERROR: ") + errorMessage);

    if (message instanceof Error && message.stack) {
      console.error(chalk.gray(message.stack.split("\n").slice(1).join("\n")));
    }
  },

  warning: (message: string) => {
    console.log(chalk.yellow("⚠️ WARNING: ") + message);
  },

  transaction: (message: string) => {
    console.log(chalk.magenta("🔄 TRANSACTION: ") + message);
  },

  tokenInfo: (params: {
    tokenAmount: bigint;
    solAmount: bigint;
    maxSolCost?: bigint;
    slippage?: string;
  }) => {
    const { tokenAmount, solAmount, maxSolCost, slippage } = params;

    console.log(chalk.cyan("💰 TOKEN INFO:"));
    console.log(chalk.cyan("  • Token amount: ") + tokenAmount.toString());
    console.log(
      chalk.cyan("  • SOL amount:   ") +
        `${solAmount.toString()} lamports (${Number(solAmount) / 1e9} SOL)`
    );

    if (maxSolCost) {
      console.log(
        chalk.cyan("  • Max cost:     ") +
          `${maxSolCost.toString()} lamports (${Number(maxSolCost) / 1e9} SOL)`
      );
    }

    if (slippage) {
      console.log(chalk.cyan("  • Slippage:     ") + slippage);
    }
  },

  computeBudget: (unitPrice: number, unitLimit: number) => {
    console.log(chalk.yellow("⚡ COMPUTE BUDGET:"));
    console.log(
      chalk.yellow("  • Price per unit: ") + `${unitPrice} micro-lamports`
    );
    console.log(chalk.yellow("  • Unit limit:     ") + unitLimit.toString());
  },

  complete: (signature: string) => {
    console.log(chalk.green("\n✨✨✨ TRANSACTION COMPLETED ✨✨✨"));
    console.log(chalk.green("Signature: ") + signature);
    console.log(
      chalk.green("Explorer URL: ") +
        `https://explorer.solana.com/tx/${signature}`
    );
    console.log(chalk.green("============================================="));
  },

  interval: (intervalSeconds: number, count?: number) => {
    if (intervalSeconds <= 0) {
      console.log(chalk.blue("⏱️ MODE: ") + "Single transaction (no interval)");
      return;
    }

    const message =
      count !== undefined
        ? `Transaction ${count} completed. Next one in ${intervalSeconds} seconds...`
        : `Running with ${intervalSeconds} seconds interval between transactions`;

    console.log(chalk.blue("⏱️ INTERVAL: ") + message);
  },

  stats: (params: {
    transactions: number;
    totalVolumeSol: number;
    runningTime: number;
  }) => {
    const { transactions, totalVolumeSol, runningTime } = params;

    const hours = Math.floor(runningTime / 3600);
    const minutes = Math.floor((runningTime % 3600) / 60);
    const seconds = Math.floor(runningTime % 60);

    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    console.log(chalk.magenta("\n📊 BOT STATISTICS 📊"));
    console.log(chalk.magenta("  • Transactions:  ") + transactions);
    console.log(
      chalk.magenta("  • Total volume:  ") + `${totalVolumeSol.toFixed(4)} SOL`
    );
    console.log(chalk.magenta("  • Running time:  ") + timeString);
    console.log(
      chalk.magenta("  • Avg. interval: ") +
        (transactions > 1
          ? `${(runningTime / (transactions - 1)).toFixed(2)} seconds`
          : "N/A")
    );
    console.log(chalk.magenta("========================================"));
  },
};
