import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeERC2771Request } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeERC2771Local } from "../src/__mock__/relay-sdk";
import { NATIVE_TOKEN } from "../src/constants";
import { ethers, deployments, network } from "hardhat";
import { expect, assert } from "chai";
import { CounterRelayContextERC2771 } from "../typechain/contracts/CounterRelayContextERC2771";
import { MockERC20 } from "../typechain/contracts/__mocks__/MockERC20";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let counterAddress: string;
let counter: CounterRelayContextERC2771;
let feeTokenAddress: string;
let feeToken: MockERC20;
let deployer: SignerWithAddress;
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
      counterAddress
    )) as CounterRelayContextERC2771;

    feeTokenAddress = (await deployments.get("MockERC20")).address;

    feeToken = (await ethers.getContractAt(
      "MockERC20",
      feeTokenAddress
    )) as MockERC20;

    const totalSupply = await feeToken.totalSupply();
    await feeToken.connect(deployer).approve(counter.address, totalSupply);

    deployerAddress = await deployer.getAddress();
    // [signer] = (await ethers.getSigners()) as ExtendedSigner[];
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

  it("Should increment count from the msg.sender", async () => {
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    // Set up the transaction request
    const { data } = await counter.populateTransaction.incrementFrom();
    if (!data) assert.fail("Invalid calldata");

    const request: CallWithSyncFeeERC2771Request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: feeToken.address, // Using MockERC20 as the fee token
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    // Call the transaction simulation
    await callWithSyncFeeERC2771Local(request);

    // Verify the counter incremented
    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });

  it("Should increment count with capped fee", async () => {
    const maxFee = ethers.utils.parseUnits("10", 6); // Example max fee in MockERC20 tokens
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    // Transfer MockERC20 tokens to the contract for fee payment
    await feeToken.transfer(counter.address, maxFee);

    // Prepare transaction request
    const { data } = await counter.populateTransaction.incrementFeeCapped(
      maxFee
    );
    if (!data) assert.fail("Invalid calldata");

    const request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: feeToken.address, // Using MockERC20 as the fee token
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    await callWithSyncFeeERC2771Local(request);

    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
  it("Should not increment count if the fee exceeds the capped amount", async () => {
    const maxFee = ethers.utils.parseUnits("1", 6); // Reduced max fee to ensure it's insufficient
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    // Prepare transaction request
    const { data } = await counter.populateTransaction.incrementFeeCapped(
      maxFee
    );
    if (!data) assert.fail("Invalid calldata");

    const request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: feeToken.address, // Using MockERC20 as the fee token
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };
    let hasTransactionFailed = false;
    try {
      await callWithSyncFeeERC2771Local(request);
    } catch (error) {
      hasTransactionFailed = true;
    }
    expect(hasTransactionFailed).to.equal(true);
    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(counterBefore.toBigInt()); // Counter should not increment
  });

  it("Should increment count from msg.sender with capped fee and permit in MockERC20", async () => {
    // Retrieve deployer's address
    const deployerAddress = await deployer.getAddress();

    // Get the current nonce for the deployer
    const nonce = await feeToken.nonces(deployerAddress);

    // Create the EIP-2612 permit signature
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const maxFee = ethers.utils.parseUnits("10", 6); // Example max fee in MockERC20 tokens

    const domain = {
      name: await feeToken.name(),
      version: "1",
      chainId: network.config.chainId,
      verifyingContract: feeToken.address,
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const message = {
      owner: deployerAddress,
      spender: counter.address,
      value: maxFee.toString(),
      nonce: nonce.toString(),
      deadline,
    };

    // Use Hardhat's signer to sign the permit message
    const sig = await deployer._signTypedData(domain, types, message);
    const { v, r, s } = ethers.utils.splitSignature(sig);

    // Store the counter value before the transaction
    const counterBefore = await counter.counter(deployerAddress);
    expect(counterBefore.toBigInt()).to.equal(0n);

    // Prepare and execute the transaction
    const { data } =
      await counter.populateTransaction.incrementFromFeeCappedWithPermit({
        maxFee,
        deadline,
        v,
        r,
        s,
      });
    if (!data) assert.fail("Invalid calldata");

    const request = {
      target: counter.address,
      user: deployerAddress,
      data: data,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true,
    };

    // Simulate the transaction
    await callWithSyncFeeERC2771Local(request);

    // Verify the counter incremented
    const counterAfter = await counter.counter(deployerAddress);
    expect(counterAfter.toBigInt()).to.equal(1n);
  });
});
