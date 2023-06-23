import { SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { sponsoredCallLocal } from "../src";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { SimpleCounter } from "../typechain/contracts/SimpleCounter";
import { Signer } from "ethers";

let counterAddress: string;
let counter: SimpleCounter;
let deployer: Signer;

describe("SimpleCounter (sponsored call)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture("SimpleCounter");

    counterAddress = (await deployments.get("SimpleCounter")).address;

    counter = (await ethers.getContractAt(
      "SimpleCounter",
      counterAddress
    )) as SimpleCounter;
  });

  it("Should increment count (1Balance)", async () => {
    const counterBefore = await counter.counter();
    expect(counterBefore.toBigInt()).to.equal(0n);

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: SponsoredCallRequest = {
      target: counterAddress,
      data: data,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallLocal(request);

    const counterAfter = await counter.counter();
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
