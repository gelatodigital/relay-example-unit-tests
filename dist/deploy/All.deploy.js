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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importStar(require("hardhat"));
const constants_1 = require("../mock/constants");
const isHardhat = hardhat_1.default.network.name === "hardhat";
const func = (hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { deploy } = hardhat_1.deployments;
    const { deployer } = yield (0, hardhat_1.getNamedAccounts)();
    if (!isHardhat) {
        console.log(`Deploying Counter to ${hre.network.name}. Hit ctrl + c to abort`);
        // await sleep(5000);
    }
    yield deploy("Counter", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
    yield deploy("CounterContext", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
    yield deploy("CounterContextERC2771", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
    yield deploy("CounterERC2771", {
        from: deployer,
        proxy: false,
        args: [constants_1.GelatoRelay1BalanceERC2771],
        log: true,
    });
    yield deploy("CounterFeeCollector", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
    yield deploy("CounterFeeCollectorERC2771", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
    yield deploy("FeeToken", {
        from: deployer,
        proxy: false,
        args: [],
        log: true,
    });
});
func.skip = () => __awaiter(void 0, void 0, void 0, function* () {
    return false;
});
func.tags = ["Counter"];
exports.default = func;
