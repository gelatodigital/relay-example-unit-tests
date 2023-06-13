import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { CounterContextERC2771 } from "../typechain/contracts/CounterContextERC2771";
import { FeeToken } from "../typechain/contracts/FeeToken";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterContextERC2771;
let feeTokenAddress: string;
let feeToken: FeeToken;
let deployer: Signer;
let deployerAddress: string;

describe("CounterContextERC2771 (sync fee with fee collector, fee token, fee, sender)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterContextERC2771")).address;

    counter = (await ethers.getContractAt(
      "CounterContextERC2771",
      counterAddress
    )) as CounterContextERC2771;

    feeTokenAddress = (await deployments.get("FeeToken")).address;

    feeToken = (await ethers.getContractAt(
      "FeeToken",
      feeTokenAddress
    )) as FeeToken;

    deployerAddress = await deployer.getAddress();
  });

  it("Should increment count (ETH)", async () => {
    expect(await counter.count(deployerAddress)).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data!,
      feeToken: NativeToken,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeERC2771Local(request, null);

    expect(await counter.count(deployerAddress)).to.equal(1);
  });

  it("Should increment count (ERC20)", async () => {
    expect(await counter.count(deployerAddress)).to.equal(0);

    const balance = await feeToken.balanceOf(deployerAddress);
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data!,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeERC2771Local(request, null);

    expect(await counter.count(deployerAddress)).to.equal(1);
  });
});
