// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {
    GelatoRelayFeeCollectorERC2771
} from "@gelatonetwork/relay-context/contracts/GelatoRelayFeeCollectorERC2771.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract CounterFeeCollectorERC2771 is GelatoRelayFeeCollectorERC2771 {
    using Address for address payable;
    mapping(address => uint256) public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    function increment() external onlyGelatoRelayERC2771 {
        address msgSender = _getMsgSender();
        counter[msgSender]++;
        payable(_getFeeCollector()).sendValue(100);

        emit IncrementCounter(counter[msgSender], msgSender);
    }
}
