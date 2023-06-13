// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

contract CounterContextERC2771 is GelatoRelayContextERC2771 {
    mapping(address => uint256) public count;

    function inc() external onlyGelatoRelayERC2771 {
        ++count[_getMsgSender()];
        _transferRelayFee();
    }
}
