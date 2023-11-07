// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/IUNI.sol';

/**
 * @title Faucet for UNI Tokens
 * @dev This contract allows to withdraw UNI tokens
 * @notice It's only permitted to withdraw a certain amount of tokens per transaction
 *
 * @author [salviega]
 * contact [salviega6gmail.com, salviega.eth]
 *
 * version 1.0
 * date 2023-11-08
 */

contract Faucet is Ownable {
	using Strings for uint256;

	/* Contracts */

	IUNI public uniContract;

	/* Constants and immutable */

	uint256 public timeoutLimit;
	uint256 public maxSupply;
	string public messageWithdrawRequire;

	/* Storage */

	mapping(address => uint256) public lastWithdrawalTimes;

	/* Events */

	event Withdrawn(address faucer, uint256 amount);

	/** @notice Faucet constructor
	 * @param _uniAddress the UNI contract address
	 * @param _maxSupply the max supply
	 * @param _timeoutLimit the timeout limit
	 * @param _messageWithdrawRequire the message for the safe mint require
	 */

	constructor(
		address _uniAddress,
		uint256 _maxSupply,
		uint256 _timeoutLimit,
		string memory _messageWithdrawRequire
	) {
		uniContract = IUNI(_uniAddress);
		maxSupply = _maxSupply;
		timeoutLimit = _timeoutLimit;
		messageWithdrawRequire = _messageWithdrawRequire;
	}

	// ************************ //
	// *       Faucet         * //
	// ************************ //

	/** @notice withdraws UNI tokens
	 * @param _amount the amount of UNI tokens to withdraw
	 */

	function withdraw(uint256 _amount) public {
		require(
			!checkIfWithdrawalTimeout(),
			'Withdrawal unavailable: still within timeout period.'
		);
		lastWithdrawalTimes[msg.sender] = block.timestamp;

		require(_amount <= maxSupply, messageWithdrawRequire);
		uniContract.safeMint(msg.sender, _amount);

		emit Withdrawn(msg.sender, _amount);
	}

	/** @notice checks if the caller is in a withdrawal timeout
	 * @return true if the caller is in a withdrawal timeout
	 */

	function checkIfWithdrawalTimeout() public returns (bool) {
		if (lastWithdrawalTimes[msg.sender] == 0) {
			lastWithdrawalTimes[msg.sender] = block.timestamp - timeoutLimit;
		}
		if (lastWithdrawalTimes[msg.sender] <= block.timestamp - timeoutLimit) {
			return false;
		}
		return true;
	}

	// ************************ //
	// *  Getters y Setters   * //
	// ************************ //

	/** @notice sets the UNI contract address
    @param _newUniAddress the new UNI contract address
    @return address the new UNI contract address
   */

	function setUniContract(
		address _newUniAddress
	) external onlyOwner returns (address) {
		uniContract = IUNI(_newUniAddress);

		return address(uniContract);
	}

	/** @notice sets max supply
	 * @param _newSupply the new max supply
	 * @return uint256 the new max supply
	 */

	function setMaxSupply(
		uint256 _newSupply
	) external onlyOwner returns (uint256) {
		maxSupply = _newSupply;
		messageWithdrawRequire = _setMessageWithdrawRequire(_newSupply);

		return maxSupply;
	}

	// ************************ //
	// *       private        * //
	// ************************ //

	/** @notice sets the message for the safe mint require
	 * @param _newSupply the new max supply
	 * @return string the new max supply
	 */

	function _setMessageWithdrawRequire(
		uint256 _newSupply
	) private pure returns (string memory) {
		return
			string(
				abi.encodePacked(
					'Max ',
					_newSupply.toString(),
					' tokens per transaction'
				)
			);
	}
}
