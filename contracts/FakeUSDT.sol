// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title FakeUSDT ERC20
/// @author cd33
contract FakeUSDT is ERC20 {
    constructor() ERC20("FakeUSDT", "USDT") {
        _mint(msg.sender, 1e12);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function decimals() public pure override returns (uint8) {
		return 6;
	}
}