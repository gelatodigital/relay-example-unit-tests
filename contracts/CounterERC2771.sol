// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract CounterERC2771 is ERC2771Context {
    mapping(address => uint256) public count;

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    { }

    function inc() external {
        ++count[_msgSender()];
    }
}
