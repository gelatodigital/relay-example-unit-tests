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
      `Deploying CounterERC2771 to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  await deploy("CounterERC2771", {
    from: deployer,
    proxy: false,
    args: [GELATO_RELAY_1BALANCE_ERC2771],
    log: true,
  });
};

func.skip = async () => !isHardhat;

func.tags = ["CounterERC2771"];

export default func;
