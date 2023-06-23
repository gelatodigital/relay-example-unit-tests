// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {
    GelatoRelayContext
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

contract CounterRelayContext is GelatoRelayContext {
    uint256 public counter;

    event IncrementCounter(uint256 newCounterValue);

    function increment() external onlyGelatoRelay {
        counter++;
        _transferRelayFee();

        emit IncrementCounter(counter);
    }
}
