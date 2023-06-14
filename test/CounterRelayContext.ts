import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../src";
import { NATIVE_TOKEN } from "../src/constants";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { Signer } from "ethers";
import { CounterRelayContext } from "../typechain/contracts/CounterRelayContext";
import { FeeToken } from "../typechain/contracts/FeeToken";

let counterAddress: string;
let counter: CounterRelayContext;
let deployer: Signer;
let feeTokenAddress: string;
let feeToken: FeeToken;

describe("CounterRelayContext (sync fee with fee collector, fee token, fee)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterRelayContext")).address;

    counter = (await ethers.getContractAt(
      "CounterRelayContext",
      counterAddress
    )) as CounterRelayContext;

    feeTokenAddress = (await deployments.get("FeeToken")).address;

    feeToken = (await ethers.getContractAt(
      "FeeToken",
      feeTokenAddress
    )) as FeeToken;
  });

  it("Should increment count (ETH)", async () => {
    expect(await counter.counter()).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.increment();

    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data,
      feeToken: NATIVE_TOKEN,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.counter()).to.equal(1);
  });

  it("Should increment count (ERC20)", async () => {
    expect(await counter.counter()).to.equal(0);

    const balance = await feeToken.balanceOf(await deployer.getAddress());
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.increment();

    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.counter()).to.equal(1);
  });
});
