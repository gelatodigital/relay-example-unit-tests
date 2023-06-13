"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
// Process Env Variables
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + "/.env" });
// const PK = process.env.PK;
// const ALCHEMY_ID = process.env.ALCHEMY_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const config = {
    solidity: "0.8.18",
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
            apiKey: ETHERSCAN_API_KEY ? ETHERSCAN_API_KEY : "",
        },
    },
};
exports.default = config;
