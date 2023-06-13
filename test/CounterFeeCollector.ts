import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { CounterFeeCollector } from "../typechain/contracts/CounterFeeCollector";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterFeeCollector;
let deployer: Signer;

describe("CounterFeeCollector (sync fee with fee collector)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterFeeCollector")).address;

    counter = (await ethers.getContractAt(
      "CounterFeeCollector",
      counterAddress
    )) as CounterFeeCollector;
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
      isRelayContext: false,
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });
});
