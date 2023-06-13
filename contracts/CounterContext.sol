// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

contract CounterContext is GelatoRelayContext {
    uint public count;

    function inc() external onlyGelatoRelay {
        ++count;
        _transferRelayFee();
    }
}
