import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../src/__mock__/relay-sdk";
import { NATIVE_TOKEN } from "../src/constants";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { CounterRelayContextERC2771 } from "../typechain/contracts/CounterRelayContextERC2771";
import { MockERC20 } from "../typechain/contracts/__mocks__/MockERC20";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterRelayContextERC2771;
let feeTokenAddress: string;
let feeToken: MockERC20;
let deployer: Signer;
let deployerAddress: string;

describe("CounterRelayContextERC2771 (sync fee with fee collector, fee token, fee, sender)", async () => {
  beforeEach("tests", async function () {
    if (network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture(["CounterRelayContextERC2771", "MockERC20"]);

    counterAddress = (await deployments.get("CounterRelayContextERC2771"))
      .address;

    counter = (await ethers.getContractAt(
      "CounterRelayContextERC2771",
      counterAddress,
    )) as CounterRelayContextERC2771;

    feeTokenAddress = (await deployments.get("MockERC20")).address;

    feeToken = (await ethers.getContractAt(
      "MockERC20",
      feeTokenAddress,
    )) as MockERC20;

    deployerAddress = await deployer.getAddress();
  });

  it("Should increment count (ETH)", async () => {
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    await setBalance(counter.address, ethers.utils.parseEther("1"));

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: NATIVE_TOKEN,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeERC2771Local(request);

    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });

  it("Should increment count (ERC20)", async () => {
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    const balance = await feeToken.balanceOf(deployerAddress);
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.increment();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeERC2771Local(request);

    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
