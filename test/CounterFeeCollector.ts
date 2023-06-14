import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../src";
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

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterFeeCollector")).address;

    counter = (await ethers.getContractAt(
      "CounterFeeCollector",
      counterAddress
    )) as CounterFeeCollector;
  });

  it("Should increment count (ETH)", async () => {
    expect(await counter.counter()).to.equal(0);

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

    expect(await counter.counter()).to.equal(1);
  });
});
