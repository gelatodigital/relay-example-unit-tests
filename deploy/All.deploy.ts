import hre, { deployments, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { GelatoRelay1BalanceERC2771 } from "../mock/constants";

const isHardhat = hre.network.name === "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isHardhat) {
    console.log(
      `Deploying Counter to ${hre.network.name}. Hit ctrl + c to abort`
    );
    // await sleep(5000);
  }

  await deploy("Counter", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterContext", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterContextERC2771", {
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });

  await deploy("CounterERC2771", {
    from: deployer,
    proxy: false,
    args: [GelatoRelay1BalanceERC2771],
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
