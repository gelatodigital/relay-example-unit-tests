import { deployments, getNamedAccounts, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const isHardhat = network.name === "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isHardhat) {
    console.log(
      `Deploying CounterFeeCollectorERC2771 to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  await deploy("CounterFeeCollectorERC2771", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });
};

func.skip = async () => !isHardhat;

func.tags = ["CounterFeeCollectorERC2771"];

export default func;
