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
exports.sponsoredCallERC2771Local = exports.sponsoredCallLocal = exports.callWithSyncFeeERC2771Local = exports.callWithSyncFeeLocal = exports.encodeWithSyncFeeERC2771 = exports.encodeWithSyncFee = void 0;
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const hardhat_1 = require("hardhat");
const constants = __importStar(require("./constants"));
const FEE = 1;
const getBalance = (address, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (token === constants.NativeToken)
        return hardhat_1.ethers.provider.getBalance(address);
    const erc20 = yield hardhat_1.ethers.getContractAt("ERC20", token);
    return erc20.balanceOf(address);
});
const encodeContext = (request) => {
    return request.isRelayContext
        ? hardhat_1.ethers.utils.solidityPack(["bytes", "address", "address", "uint256"], [request.data, constants.FeeCollector, request.feeToken, FEE])
        : hardhat_1.ethers.utils.solidityPack(["bytes", "address"], [request.data, constants.FeeCollector]);
};
const encodeWithSyncFee = (request) => {
    const data = encodeContext(request);
    const tx = {
        to: request.target,
        from: constants.GelatoRelay,
        data: data,
    };
    return tx;
};
exports.encodeWithSyncFee = encodeWithSyncFee;
const encodeWithSyncFeeERC2771 = (request) => {
    const context = encodeContext(request);
    const data = hardhat_1.ethers.utils.solidityPack(["bytes", "address"], [context, request.user]);
    const tx = {
        to: request.target,
        from: constants.GelatoRelayERC2771,
        data: data,
    };
    return tx;
};
exports.encodeWithSyncFeeERC2771 = encodeWithSyncFeeERC2771;
const callWithSyncFeeBoth = (tx, feeToken) => __awaiter(void 0, void 0, void 0, function* () {
    const gelato = yield hardhat_1.ethers.getImpersonatedSigner(tx.from);
    yield (0, hardhat_network_helpers_1.setBalance)(gelato.address, hardhat_1.ethers.utils.parseEther("1"));
    const balanceBefore = yield getBalance(constants.FeeCollector, feeToken);
    const res = yield gelato.sendTransaction({ to: tx.to, data: tx.data });
    const balanceAfter = yield getBalance(constants.FeeCollector, feeToken);
    if (balanceAfter.toBigInt() - balanceBefore.toBigInt() < FEE)
        throw "Insufficient relay fee";
    return res;
});
const callWithSyncFeeLocal = (request) => {
    const tx = encodeWithSyncFee(request);
    return callWithSyncFeeBoth(tx, request.feeToken);
};
exports.callWithSyncFeeLocal = callWithSyncFeeLocal;
const callWithSyncFeeERC2771Local = (request, 
/* eslint-disable */
provider) => {
    const tx = encodeWithSyncFeeERC2771(request);
    return callWithSyncFeeBoth(tx, request.feeToken);
};
exports.callWithSyncFeeERC2771Local = callWithSyncFeeERC2771Local;
const sponsoredCallLocal = (request, 
/* eslint-disable */
sponsorApiKey) => __awaiter(void 0, void 0, void 0, function* () {
    const [deployer] = yield hardhat_1.ethers.getSigners();
    return deployer.sendTransaction({ to: request.target, data: request.data });
});
exports.sponsoredCallLocal = sponsoredCallLocal;
const sponsoredCallERC2771Local = (request, 
/* eslint-disable */
provider, sponsorApiKey) => __awaiter(void 0, void 0, void 0, function* () {
    const gelato = yield hardhat_1.ethers.getImpersonatedSigner(constants.GelatoRelay1BalanceERC2771);
    yield (0, hardhat_network_helpers_1.setBalance)(gelato.address, hardhat_1.ethers.utils.parseEther("1"));
    const data = hardhat_1.ethers.utils.solidityPack(["bytes", "address"], [request.data, request.user]);
    return gelato.sendTransaction({ to: request.target, data });
});
exports.sponsoredCallERC2771Local = sponsoredCallERC2771Local;
