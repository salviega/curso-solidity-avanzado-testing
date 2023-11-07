// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/token/ERC777/ERC777.sol';

contract Recipient is IERC777Recipient {
	/* Contracts */

	ERC777 public immutable erc777;

	constructor(address _erc777Address) {
		IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24)
			.setInterfaceImplementer(
				address(this),
				keccak256('ERC777TokensRecipient'),
				address(this)
			);
		erc777 = ERC777(_erc777Address);
	}

	function deposit(uint256 _amount) internal {
		erc777.operatorSend(msg.sender, address(this), _amount, '', '');
	}

	function transferTaxFee(
		address _from,
		address _artist,
		uint256 _taxFee
	) internal {
		erc777.operatorSend(_from, _artist, _taxFee, '', '');
	}

	// The following functions are overrides required by Solidity.

	function tokensReceived(
		address _operator,
		address _from,
		address _to,
		uint256 _amount,
		bytes calldata _userData,
		bytes calldata _operatorData
	) external override {
		// do nothing
	}
}
