import { deployments, getNamedAccounts, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { GELATO_RELAY_1BALANCE_ERC2771 } from "../src/constants";

const isHardhat = network.name === "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isHardhat) {
    console.log(
      `Deploying Counter to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await new Promise((r) => setTimeout(r, 5000));
  }

  await deploy("SimpleCounter", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterERC2771", {
    from: deployer,
    proxy: false,
    args: [GELATO_RELAY_1BALANCE_ERC2771],
    log: true,
  });

  await deploy("CounterRelayContext", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterRelayContextERC2771", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterFeeCollector", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterFeeCollectorERC2771", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("FeeToken", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });
};

func.skip = async () => {
  return false;
};

func.tags = ["Counter"];

export default func;
