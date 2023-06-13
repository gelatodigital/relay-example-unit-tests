// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@gelatonetwork/relay-context/contracts/GelatoRelayFeeCollectorERC2771.sol";

address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

contract CounterFeeCollectorERC2771 is GelatoRelayFeeCollectorERC2771 {
    using SafeERC20 for IERC20;
    mapping(address => uint256) public count;

    function inc() external onlyGelatoRelayERC2771 {
        ++count[_getMsgSender()];
        transfer(NATIVE_TOKEN, _getFeeCollector(), 100);
    }

    function transfer(address token, address to, uint256 amount) internal {
        token == NATIVE_TOKEN
            ? Address.sendValue(payable(to), amount)
            : IERC20(token).safeTransfer(to, amount);
    }
}
