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
        new HDWalletProvider(
          process.env.MNEMONIC, // Your wallet mnemonic phrase
          `https://holesky.infura.io/v3/${process.env.INFURA_PROJECT_ID}` // Infura URL for Holesky
        ),
      network_id: 17000,        // Holesky Testnet chain ID
      gas: 6721975,             // Gas limit
      gasPrice: 1000000000,     // 1 Gwei (in wei)
      confirmations: 2,         // Wait for 2 confirmations
      timeoutBlocks: 500,       // Wait up to 200 blocks for confirmation
      skipDryRun: true          // Skip dry run before migrations
    },
  },
  mocha: {
    // Custom mocha options
  },
  compilers: {
    solc: {
      version: "0.4.25",        // Solidity version
    }
  }
};
