import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { sponsoredCallLocal } from "../mock/relay";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Counter (sponsored call)", async () => {
  const deploy = async () => {
    const [deployer] = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    return { counter, deployer };
  }

  it("Should increment count (1Balance)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count()).to.equal(0);

    const { data } = await counter.populateTransaction.inc();

    const request: SponsoredCallRequest = {
      target: counter.address,
      data: data!,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallLocal(request, '');

    expect(await counter.count()).to.equal(1);
  });
});
