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
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const relay_1 = require("../mock/relay");
const constants_1 = require("../mock/constants");
const hardhat_1 = __importStar(require("hardhat"));
const chai_1 = require("chai");
let counterAddress;
let counter;
let feeTokenAddress;
let feeToken;
let deployer;
let deployerAddress;
describe("CounterContextERC2771 (sync fee with fee collector, fee token, fee, sender)", () => __awaiter(void 0, void 0, void 0, function* () {
    beforeEach("tests", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (hardhat_1.default.network.name !== "hardhat") {
                console.error("Test Suite is meant to be run on hardhat only");
                process.exit(1);
            }
            [deployer] = yield hardhat_1.ethers.getSigners();
            yield hardhat_1.deployments.fixture();
            counterAddress = (yield hardhat_1.deployments.get("CounterContextERC2771")).address;
            counter = (yield hardhat_1.ethers.getContractAt("CounterContextERC2771", counterAddress));
            feeTokenAddress = (yield hardhat_1.deployments.get("FeeToken")).address;
            feeToken = (yield hardhat_1.ethers.getContractAt("FeeToken", feeTokenAddress));
            deployerAddress = yield deployer.getAddress();
        });
    });
    it("Should increment count (ETH)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(yield counter.count(deployerAddress)).to.equal(0);
        yield (0, hardhat_network_helpers_1.setBalance)(counter.address, hardhat_1.ethers.utils.parseEther("1"));
        const { data } = yield counter.populateTransaction.inc();
        const request = {
            target: counter.address,
            user: deployerAddress,
            data: data,
            feeToken: constants_1.NativeToken,
            chainId: yield deployer.getChainId(),
            isRelayContext: true,
        };
        yield (0, relay_1.callWithSyncFeeERC2771Local)(request, null);
        (0, chai_1.expect)(yield counter.count(deployerAddress)).to.equal(1);
    }));
    it("Should increment count (ERC20)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(yield counter.count(deployerAddress)).to.equal(0);
        const balance = yield feeToken.balanceOf(deployerAddress);
        yield feeToken.transfer(counter.address, balance);
        const { data } = yield counter.populateTransaction.inc();
        const request = {
            target: counter.address,
            user: deployerAddress,
            data: data,
            feeToken: feeToken.address,
            chainId: yield deployer.getChainId(),
            isRelayContext: true,
        };
        yield (0, relay_1.callWithSyncFeeERC2771Local)(request, null);
        (0, chai_1.expect)(yield counter.count(deployerAddress)).to.equal(1);
    }));
}));