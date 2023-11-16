// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {GelatoRelayContextERC2771} from "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

contract CounterRelayContextERC2771 is GelatoRelayContextERC2771 {
    struct FeeCappedPermit {
        uint256 maxFee;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    mapping(address => uint256) public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    function increment() external onlyGelatoRelayERC2771 {
        address msgSender = _getMsgSender();
        counter[msgSender]++;
        _transferRelayFee();

        emit IncrementCounter(counter[msgSender], msgSender);
    }

    function incrementFrom() external onlyGelatoRelayERC2771 {
        address msgSender = _getMsgSender();
        counter[msgSender]++;
        _transferFromRelayFee();

        emit IncrementCounter(counter[msgSender], msgSender);
    }

    function incrementFeeCapped(
        uint256 maxFee
    ) external onlyGelatoRelayERC2771 {
        _transferRelayFeeCapped(maxFee);
        // Incrementing the counter mapped to the _getMsgSender()
        counter[_getMsgSender()]++;
        emit IncrementCounter(counter[_getMsgSender()], _getMsgSender());
    }

    function incrementFromFeeCapped(
        uint256 maxFee
    ) external onlyGelatoRelayERC2771 {
        _transferFromRelayFeeCapped(maxFee);
        // Incrementing the counter mapped to the _getMsgSender()
        counter[_getMsgSender()]++;
        emit IncrementCounter(counter[_getMsgSender()], _getMsgSender());
    }

    function incrementFromFeeCappedWithPermit(
        FeeCappedPermit calldata permitData
    ) external onlyGelatoRelayERC2771 {
        _transferFromRelayFeeCappedWithPermit(
            permitData.maxFee,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        );
        // Incrementing the counter mapped to the _getMsgSender()
        counter[_getMsgSender()]++;
        emit IncrementCounter(counter[_getMsgSender()], _getMsgSender());
    }
}
