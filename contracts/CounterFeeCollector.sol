// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {
    GelatoRelayFeeCollector
} from "@gelatonetwork/relay-context/contracts/GelatoRelayFeeCollector.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract CounterFeeCollector is GelatoRelayFeeCollector {
    using Address for address payable;

    uint256 public counter;

    event IncrementCounter(uint256 newCounterValue);

    function increment() external onlyGelatoRelay {
        counter++;
        payable(_getFeeCollector()).sendValue(100);

        emit IncrementCounter(counter);
    }
}
