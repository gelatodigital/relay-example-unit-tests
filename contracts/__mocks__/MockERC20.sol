// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract MockERC20 is ERC20, ERC20Permit {
    constructor() ERC20("MockERC20", "ERC20") ERC20Permit("MockERC20") {
        _mint(msg.sender, 1000e6);
    }
}
