import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../src/__mock__/relay-sdk";
import { NATIVE_TOKEN } from "../src/constants";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { CounterFeeCollectorERC2771 } from "../typechain/contracts/CounterFeeCollectorERC2771";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterFeeCollectorERC2771;
let deployer: Signer;
let deployerAddress: string;

describe("CounterFeeCollectorERC2771 (sync fee with fee collector, sender)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture("CounterFeeCollectorERC2771");

    counterAddress = (await deployments.get("CounterFeeCollectorERC2771"))
      .address;

    counter = (await ethers.getContractAt(
      "CounterFeeCollectorERC2771",
      counterAddress,
    )) as CounterFeeCollectorERC2771;

    deployerAddress = await deployer.getAddress();
  });

  it("Should increment count (ETH)", async () => {
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: NATIVE_TOKEN,
      chainId: await deployer.getChainId(),
      isRelayContext: false,
    };

    await callWithSyncFeeERC2771Local(request);

    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
