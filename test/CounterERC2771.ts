import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { sponsoredCallERC2771Local } from "../mock/relay";
import hre, { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { CounterERC2771 } from "../typechain/contracts/CounterERC2771";
import { Signer } from "ethers";

let counterAddress: string;
let counter: CounterERC2771;
let deployer: Signer;
let deployerAddress: string;

describe("CounterERC2771 (sponsored call from trusted forwarder with sender)", async () => {
  beforeEach("tests", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }
    [deployer] = await ethers.getSigners();

    await deployments.fixture();

    counterAddress = (await deployments.get("CounterERC2771")).address;

    counter = (await ethers.getContractAt(
      "CounterERC2771",
      counterAddress
    )) as CounterERC2771;

    deployerAddress = await deployer.getAddress();
  });

  it("Should increment count (1Balance)", async () => {
    expect(await counter.count(deployerAddress)).to.equal(0);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data!,
      chainId: await deployer.getChainId(),
    };

    await sponsoredCallERC2771Local(request, null, "");

    expect(await counter.count(deployerAddress)).to.equal(1);
  });
});
