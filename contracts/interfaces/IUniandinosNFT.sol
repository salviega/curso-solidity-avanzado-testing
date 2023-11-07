// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface IUniandinosNFT is IERC721 {
	function safeMint(
		address _artist,
		string calldata _tokenURI,
		uint256 _taxFee
	) external;
}
