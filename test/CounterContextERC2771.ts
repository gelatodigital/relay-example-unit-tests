import { loadFixture, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("CounterContextERC2771 (sync fee with fee collector, fee token, fee, sender)", async () => {
  const deploy = async () => {
    const [deployer] = await ethers.getSigners();

    const CounterContextERC2771 = await ethers.getContractFactory("CounterContextERC2771");
    const counter = await CounterContextERC2771.deploy();

    return { counter, deployer };
  }

  it("Should increment count (ETH)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count(deployer.address)).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther('1'));

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployer.address,
      data: data!,
      feeToken: NativeToken,
      chainId: await deployer.getChainId(),
      isRelayContext: true
    };

    await callWithSyncFeeERC2771Local(request, null);

    expect(await counter.count(deployer.address)).to.equal(1);
  });

  it("Should increment count (ERC20)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count(deployer.address)).to.equal(0);

    const FeeToken = await ethers.getContractFactory("FeeToken");
    const feeToken = await FeeToken.deploy();

    const balance = await feeToken.balanceOf(deployer.address);
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployer.address,
      data: data!,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true
    };

    await callWithSyncFeeERC2771Local(request, null);

    expect(await counter.count(deployer.address)).to.equal(1);
  });
});
