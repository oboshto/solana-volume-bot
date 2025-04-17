# Jop Solana Volume Bot

A bot for creating trading volume on Solana tokens by performing buy and sell operations in a single transaction. **Note: Currently, this bot is primarily designed and tested for tokens on Pump.fun.**

## Features

- Configurable SOL amount and slippage percentage
- Customizable RPC endpoint
- Priority fee support for faster transaction processing
- Configurable interval for automatic recurring transactions
- Easy setup via environment variables

## Setup

1. Clone the repository:

```
git clone https://github.com/oboshto/solana-volume-bot.git
cd solana-volume-bot
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file based on the `.env.example`:

```
cp .env.example .env
```

4. Edit the `.env` file with your configuration:

```
# Solana private key (base58 encoded)
PRIVATE_KEY=your_private_key_here

# Amount to buy in SOL
BUY_AMOUNT_IN_SOL=0.01

# Slippage percentage (e.g., 1 for 1%)
SLIPPAGE_PERCENTAGE=1

# Token mint address
TOKEN_MINT=token_mint_address_here

# RPC URL (use a reliable RPC provider)
RPC_URL=https://api.mainnet-beta.solana.com

# Priority fee in SOL (0 for no priority fee)
PRIORITY_FEE_SOL=0.0001

# Interval between transactions in seconds (0 for single transaction)
TRANSACTION_INTERVAL_SECONDS=30
```

## Usage

To run the bot:

```
npm run bot
```

## Transaction Intervals

The bot can run in two modes:

- **Single transaction mode**: Set `TRANSACTION_INTERVAL_SECONDS=0` to run a single buy/sell transaction and exit
- **Recurring transaction mode**: Set `TRANSACTION_INTERVAL_SECONDS` to a positive value (e.g., 30) to run transactions repeatedly with the specified interval

In recurring mode, the bot will:

- Execute buy/sell transactions at regular intervals
- Track and display statistics (total transactions, volume, running time)
- Continue running until manually stopped (Ctrl+C)

## Priority Fees

Priority fees help your transaction get processed faster during network congestion:

- Set `PRIORITY_FEE_SOL` to a positive value (e.g., 0.0001 SOL) to use priority fees
- Higher values generally result in faster transaction processing
- Setting to 0 disables priority fees

## Platform Fees (Pump.fun)

Please be aware that the Pump.fun platform imposes a 1% fee on _every_ buy transaction and _every_ sell transaction made through its bonding curve mechanism, which this bot utilizes for Pump.fun tokens. These platform fees are separate from standard Solana network transaction fees and any optional priority fees configured in the `.env` file.

## Contact

For questions or support:

- Telegram: [t.me/yobebka](https://t.me/yobebka)
- Discord: [Jop's Discord](https://discordapp.com/users/600250420480442390)

## Warning

This bot is for educational purposes only. Trading tokens involves financial risk. Only use funds you can afford to lose.

## License

MIT
