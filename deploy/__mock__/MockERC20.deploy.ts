import { deployments, getNamedAccounts, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const isHardhat = network.name === "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isHardhat) {
    console.log(
      `Deploying MockERC20 to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  await deploy("MockERC20", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });
};

func.skip = async () => !isHardhat;

func.tags = ["MockERC20"];

export default func;
