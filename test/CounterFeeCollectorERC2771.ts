import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { CounterFeeCollectorERC2771 } from "../typechain/contracts/CounterFeeCollectorERC2771";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterFeeCollectorERC2771;
let deployer: Signer;
let deployerAddress: string;

describe("CounterFeeCollectorERC2771 (sync fee with fee collector, sender)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterFeeCollectorERC2771"))
      .address;

    counter = (await ethers.getContractAt(
      "CounterFeeCollectorERC2771",
      counterAddress
    )) as CounterFeeCollectorERC2771;

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
      isRelayContext: false,
    };

    await callWithSyncFeeERC2771Local(request, null);

    expect(await counter.count(deployerAddress)).to.equal(1);
  });
});
