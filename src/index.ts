import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import * as constants from "./constants";

import {
  CallWithSyncFeeRequest,
  CallWithSyncFeeERC2771Request,
  SponsoredCallRequest,
  CallWithERC2771Request,
} from "@gelatonetwork/relay-sdk";

const FEE = 1;

const getBalance = async (address: string, token: string) => {
  if (token === constants.NATIVE_TOKEN)
    return ethers.provider.getBalance(address);

  const erc20 = await ethers.getContractAt("MockERC20", token);
  return erc20.balanceOf(address);
};

const encodeContext = (
  request: CallWithSyncFeeRequest | CallWithSyncFeeERC2771Request
): string => {
  return request.isRelayContext
    ? ethers.utils.solidityPack(
        ["bytes", "address", "address", "uint256"],
        [request.data, constants.FEE_COLLECTOR, request.feeToken, FEE]
      )
    : ethers.utils.solidityPack(
        ["bytes", "address"],
        [request.data, constants.FEE_COLLECTOR]
      );
};

interface Transaction {
  to: string;
  from: string;
  data: string;
}

const encodeWithSyncFee = (request: CallWithSyncFeeRequest): Transaction => {
  const data = encodeContext(request);

  const tx: Transaction = {
    to: request.target,
    from: constants.GELATO_RELAY,
    data: data,
  };

  return tx;
};

const encodeWithSyncFeeERC2771 = (
  request: CallWithSyncFeeERC2771Request
): Transaction => {
  const context = encodeContext(request);

  const data = ethers.utils.solidityPack(
    ["bytes", "address"],
    [context, request.user]
  );

  const tx: Transaction = {
    to: request.target,
    from: constants.GELATO_RELAY_ERC2771,
    data: data,
  };

  return tx;
};

const callWithSyncFeeBoth = async (tx: Transaction, feeToken: string) => {
  const gelato = await ethers.getImpersonatedSigner(tx.from);
  await setBalance(gelato.address, ethers.utils.parseEther("1"));

  const balanceBefore = await getBalance(constants.FEE_COLLECTOR, feeToken);
  const res = await gelato.sendTransaction({ to: tx.to, data: tx.data });
  const balanceAfter = await getBalance(constants.FEE_COLLECTOR, feeToken);

  if (balanceAfter.toBigInt() - balanceBefore.toBigInt() < FEE)
    throw "Insufficient relay fee";

  return res;
};

const callWithSyncFeeLocal = (request: CallWithSyncFeeRequest) => {
  const tx = encodeWithSyncFee(request);
  return callWithSyncFeeBoth(tx, request.feeToken);
};

const callWithSyncFeeERC2771Local = (
  request: CallWithSyncFeeERC2771Request,
  /* eslint-disable */
  provider?: any
) => {
  const tx = encodeWithSyncFeeERC2771(request);
  return callWithSyncFeeBoth(tx, request.feeToken);
};

const sponsoredCallLocal = async (
  request: SponsoredCallRequest,
  /* eslint-disable */
  sponsorApiKey?: string
) => {
  const [deployer] = await ethers.getSigners();
  return deployer.sendTransaction({ to: request.target, data: request.data });
};

const sponsoredCallERC2771Local = async (
  request: CallWithERC2771Request,
  /* eslint-disable */
  provider?: any,
  sponsorApiKey?: string
) => {
  const gelato = await ethers.getImpersonatedSigner(
    constants.GELATO_RELAY_1BALANCE_ERC2771
  );

  await setBalance(gelato.address, ethers.utils.parseEther("1"));

  const data = ethers.utils.solidityPack(
    ["bytes", "address"],
    [request.data, request.user]
  );

  return gelato.sendTransaction({ to: request.target, data });
};

export {
  encodeWithSyncFee,
  encodeWithSyncFeeERC2771,
  callWithSyncFeeLocal,
  callWithSyncFeeERC2771Local,
  sponsoredCallLocal,
  sponsoredCallERC2771Local,
};
