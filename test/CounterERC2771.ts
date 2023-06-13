import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { GelatoRelay1BalanceERC2771 } from "../mock/constants";
import { sponsoredCallERC2771Local } from "../mock/relay";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("CounterERC2771 (sponsored call from trusted forwarder with sender)", async () => {
  const deploy = async () => {
    const [deployer] = await ethers.getSigners();

    const CounterERC2771 = await ethers.getContractFactory("CounterERC2771");
    const counter = await CounterERC2771.deploy(GelatoRelay1BalanceERC2771);

    return { counter, deployer };
  }

  it("Should increment count (1Balance)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count(deployer.address)).to.equal(0);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithERC2771Request = {
      target: counter.address,
      user: deployer.address,
      data: data!,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallERC2771Local(request, null, '');

    expect(await counter.count(deployer.address)).to.equal(1);
  });
});
