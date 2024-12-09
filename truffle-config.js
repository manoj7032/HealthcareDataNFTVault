require('dotenv').config(); // Load environment variables from .env
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Ganache default port
      network_id: "5777",    // Ganache network ID
    },
    holesky: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: process.env.MNEMONIC,  // Wallet mnemonic phrase
          providerOrUrl: process.env.RPC_URL, // Alchemy RPC URL for Holesky
          pollingInterval: 15000,          // Polling interval for block updates
        }),
      network_id: 17000,        // Holesky Testnet chain ID
      gas: 8000000,             // Gas limit
      gasPrice: 1000000000,     // 1 Gwei (in wei)
      confirmations: 2,         // Wait for 2 confirmations
      timeoutBlocks: 500,       // Wait up to 500 blocks for confirmation
      skipDryRun: true          // Skip dry run before migrations
    },
  },
  mocha: {
    // Custom mocha options
    timeout: 100000,            // Increase timeout for Holesky migrations
  },
  compilers: {
    solc: {
      version: "0.4.25",        // Solidity compiler version
    }
  }
};
