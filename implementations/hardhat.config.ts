import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "@typechain/hardhat";
import "hardhat-packager";

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  packager: {
    contracts: [
      "ERC725X",
      "ERC725XInit",
      "ERC725Y",
      "ERC725YInit",
      "ERC725",
      "ERC725Init",
    ],
  },
  paths: {
    artifacts: "artifacts",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
