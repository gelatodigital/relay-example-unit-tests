import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { CounterContext } from "../typechain/contracts/CounterContext";
import { FeeToken } from "../typechain/contracts/FeeToken";
let counterAddress: string;
let counter: CounterContext;
let deployer: Signer;
let feeTokenAddress: string;
let feeToken: FeeToken;

describe("CounterContext (sync fee with fee collector, fee token, fee)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterContext")).address;

    counter = (await ethers.getContractAt(
      "CounterContext",
      counterAddress
    )) as CounterContext;

    feeTokenAddress = (await deployments.get("FeeToken")).address;

    feeToken = (await ethers.getContractAt(
      "FeeToken",
      feeTokenAddress
    )) as FeeToken;
  });

  it("Should increment count (ETH)", async () => {
    expect(await counter.count()).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data!,
      feeToken: NativeToken,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });

  it("Should increment count (ERC20)", async () => {
    expect(await counter.count()).to.equal(0);

    const balance = await feeToken.balanceOf(await deployer.getAddress());
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data!,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });
});
