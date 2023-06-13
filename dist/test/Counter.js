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
const relay_1 = require("../mock/relay");
const hardhat_1 = __importStar(require("hardhat"));
const chai_1 = require("chai");
let counterAddress;
let counter;
let deployer;
describe("Counter (sponsored call)", () => __awaiter(void 0, void 0, void 0, function* () {
    beforeEach("tests", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (hardhat_1.default.network.name !== "hardhat") {
                console.error("Test Suite is meant to be run on hardhat only");
                process.exit(1);
            }
            [deployer] = yield hardhat_1.ethers.getSigners();
            yield hardhat_1.deployments.fixture();
            counterAddress = (yield hardhat_1.deployments.get("Counter")).address;
            counter = (yield hardhat_1.ethers.getContractAt("Counter", counterAddress));
        });
    });
    it("Should increment count (1Balance)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield counter.populateTransaction.inc();
        const request = {
            target: counterAddress,
            data: data,
            chainId: yield deployer.getChainId(),
        };
        yield (0, relay_1.sponsoredCallLocal)(request, "");
        (0, chai_1.expect)(yield counter.count()).to.equal(1);
    }));
}));
