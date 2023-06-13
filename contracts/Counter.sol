// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract Counter {
    uint public count;

    function inc() external {
        ++count;
    }
}
