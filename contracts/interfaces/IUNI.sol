// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC777/ERC777.sol';

interface IUNI is IERC777 {
	function safeMint(address _to, uint256 _amount) external;
}
