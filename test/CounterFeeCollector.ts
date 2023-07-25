import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../src/__mock__/relay-sdk";
import { NATIVE_TOKEN } from "../src/constants";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { CounterFeeCollector } from "../typechain/contracts/CounterFeeCollector";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterFeeCollector;
let deployer: Signer;

describe("CounterFeeCollector (sync fee with fee collector)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture("CounterFeeCollector");

    counterAddress = (await deployments.get("CounterFeeCollector")).address;

    counter = (await ethers.getContractAt(
      "CounterFeeCollector",
      counterAddress,
    )) as CounterFeeCollector;
  });

  it("Should increment count (ETH)", async () => {
    const counterBefore = await counter.counter();
    expect(counterBefore.toBigInt()).to.equal(0n);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data,
      feeToken: NATIVE_TOKEN,
      chainId: await deployer.getChainId(),
      isRelayContext: false,
    };

    await callWithSyncFeeLocal(request);

    const counterAfter = await counter.counter();
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
