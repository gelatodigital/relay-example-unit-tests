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

    await deployments.fixture();

    counterAddress = (await deployments.get("SimpleCounter")).address;

    counter = (await ethers.getContractAt(
      "SimpleCounter",
      counterAddress
    )) as SimpleCounter;
  });

  it("Should increment count (1Balance)", async () => {
    const { data } = await counter.populateTransaction.increment();

    if (!data) assert.fail("Invalid calldata");

    const request: SponsoredCallRequest = {
      target: counterAddress,
      data: data,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallLocal(request, "");

    expect(await counter.counter()).to.equal(1);
  });
});
