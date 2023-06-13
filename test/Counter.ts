import { SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { sponsoredCallLocal } from "../mock/relay";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { Counter } from "../typechain/contracts/Counter";
import { Signer } from "ethers";

let counterAddress: string;
let counter: Counter;
let deployer: Signer;

describe("Counter (sponsored call)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("Counter")).address;

    counter = (await ethers.getContractAt(
      "Counter",
      counterAddress
    )) as Counter;
  });

  it("Should increment count (1Balance)", async () => {
    const { data } = await counter.populateTransaction.inc();

    const request: SponsoredCallRequest = {
      target: counterAddress,
      data: data!,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallLocal(request, "");

    expect(await counter.count()).to.equal(1);
  });
});
