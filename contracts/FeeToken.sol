// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FeeToken is ERC20 {
    constructor()
        ERC20("FeeToken", "FEE")
    {
        _mint(msg.sender, 1000e6);
    }
}
