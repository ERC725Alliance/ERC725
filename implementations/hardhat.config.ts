import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
