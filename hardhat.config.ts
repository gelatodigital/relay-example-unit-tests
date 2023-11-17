import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

// const PK = process.env.PK;
// const ALCHEMY_ID = process.env.ALCHEMY_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  // hardhat-deploy
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY || "",
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          viaIR: true
        },
      },
    ],
  },
};

export default config;
