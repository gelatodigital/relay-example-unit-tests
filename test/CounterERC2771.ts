import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { sponsoredCallERC2771Local } from "../src";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { CounterERC2771 } from "../typechain/contracts/CounterERC2771";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterERC2771;
let deployer: Signer;
let deployerAddress: string;

describe("CounterERC2771 (sponsored call from trusted forwarder with sender)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture("CounterERC2771");

    counterAddress = (await deployments.get("CounterERC2771")).address;

    counter = (await ethers.getContractAt(
      "CounterERC2771",
      counterAddress
    )) as CounterERC2771;

    deployerAddress = await deployer.getAddress();
  });

  it("Should increment count (1Balance)", async () => {
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallERC2771Local(request);

    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
