// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {
    ERC2771Context
} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract CounterERC2771 is ERC2771Context {
    mapping(address => uint256) public counter;

    event IncrementCounter(uint256 newCounterValue, address msgSender);

    // solhint-disable-next-line no-empty-blocks
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function increment() external {
        address msgSender = _msgSender();
        counter[msgSender]++;

        emit IncrementCounter(counter[msgSender], msgSender);
    }
}
