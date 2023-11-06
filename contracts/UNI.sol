// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC777/ERC777.sol';

 /**
 * @title  UNI Token
 * @dev This contract allows to withdraw UNI tokens
 * @notice The owner is only allowed to mint tokens
 *
 * @author [salviega]
 * contact [salviega6gmail.com, salviega.eth]
 *
 * version 1.0
 * date 2023-11-08
 */

contract UNI is ERC777, Ownable {
	constructor(
		string memory _name,
		string memory _symbol,
		address[] memory _defaultOperators,
	) ERC777(_name, _symbol, _defaultOperators) {}

	/** @notice mints UNI tokens
	 * @param _to the address to mint to
	 */

	function safeMint(address _to, uint256 _amount) external onlyOwner {
		_mint(_to, _amount, '', '');
	}
}
