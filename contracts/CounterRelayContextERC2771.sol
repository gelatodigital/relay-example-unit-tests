// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {
    GelatoRelayContextERC2771
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

contract CounterRelayContextERC2771 is GelatoRelayContextERC2771 {
    mapping(address => uint256) public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    function increment() external onlyGelatoRelayERC2771 {
        address msgSender = _getMsgSender();
        counter[msgSender]++;
        _transferRelayFee();

        emit IncrementCounter(counter[msgSender], msgSender);
    }
}
