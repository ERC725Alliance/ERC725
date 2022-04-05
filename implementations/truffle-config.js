module.exports = {
  contracts_build_directory: "./artifacts",

  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
    },
  },

  // networks: {
  //   development: {
  //     host: "127.0.0.1",
  //     port: 8545,
  //     network_id: "*" // Match any network id
  //   }
  // },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4", // Fetch exact version from solc-bin (default: truffle's version) //0.6.10
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },

  plugins: ["solidity-coverage"],
};
