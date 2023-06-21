import { HardhatUserConfig } from 'hardhat/config';

/**
 * this package includes:
 *  - @nomiclabs/hardhat-ethers
 *  - @nomicfoundation/hardhat-chai-matchers
 *  - @nomicfoundation/hardhat-network-helpers
 *  - @nomiclabs/hardhat-etherscan
 *  - @typechain/hardhat
 *  - hardhat-gas-reporter
 *  - solidity-coverage
 */
import '@nomicfoundation/hardhat-toolbox';

import 'hardhat-packager';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  packager: {
    contracts: ['ERC725X', 'ERC725XInit', 'ERC725Y', 'ERC725YInit', 'ERC725', 'ERC725Init'],
  },
  paths: {
    artifacts: 'artifacts',
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21,
    excludeContracts: ['helpers/'],
    src: './contracts',
    showMethodSig: true,
  },
};

export default config;
