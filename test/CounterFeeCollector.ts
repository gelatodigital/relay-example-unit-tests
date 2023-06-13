import { loadFixture, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("CounterFeeCollector (sync fee with fee collector)", async () => {
  const deploy = async () => {
    const [deployer] = await ethers.getSigners();

    const CounterFeeCollector = await ethers.getContractFactory("CounterFeeCollector");
    const counter = await CounterFeeCollector.deploy();

    return { counter, deployer };
  }

  it("Should increment count (ETH)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count()).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther('1'));

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data!,
      feeToken: NativeToken,
      chainId: await deployer.getChainId(),
      isRelayContext: false
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });
});
