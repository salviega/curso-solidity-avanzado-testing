// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './interfaces/IUNI.sol';

contract UniandinosNFT is ERC721URIStorage, Ownable {
	using Counters for Counters.Counter;

	Counters.Counter public tokenIdCounter;

	/* Contracts */

	IUNI public uni;

	address public marketplaceAddress;

	/* Storage */

	struct Royalty {
		address artist;
		uint256 taxFee;
		address addressTaxFeeToken;
	}

	mapping(address => address) public artists;
	mapping(uint256 => Royalty) public royalties;
	mapping(address => mapping(address => bool)) excludedListByArtist;

	/** @notice UniandinosNFT constructor
	 * @param _marketplaceAddress the marketplace contract address
	 * @param _uniAddress the UNI contract address
	 * @param _name the token name
	 * @param _symbol the token symbol
	 */

	constructor(
		address _marketplaceAddress,
		address _uniAddress,
		string memory _name,
		string memory _symbol
	) ERC721(_name, _symbol) {
		marketplaceAddress = _marketplaceAddress;
		uni = IUNI(_uniAddress);
	}

	// ************************ //
	// *      UniandinosNFT   * //
	// ************************ //

	function safeMint(
		address _artist,
		string calldata _tokenURI,
		uint256 _taxFee
	) public onlyOwner returns (uint256) {
		uint256 tokenId = tokenIdCounter.current();
		tokenIdCounter.increment();

		Royalty memory royalty = Royalty(_artist, _taxFee, address(uni));

		royalties[tokenId] = royalty;

		_safeMint(msg.sender, tokenId);
		_setTokenURI(tokenId, _tokenURI);

		return tokenId;
	}

	// ************************ //
	// *  Getters y Setters   * //
	// ************************ //

	/** @notice Checks if an address is excluded from paying tax fee for a given artist's NFT.
	 * @param _artist The address of the artist.
	 * @param _excluded The address to check.
	 * @return _isExcluded Whether the address is excluded from paying tax fee or not.
	 */
	function isExcluded(
		address _artist,
		address _excluded
	) external view returns (bool _isExcluded) {
		return excludedListByArtist[_artist][_excluded];
	}

	/** @dev Select address that don't pay tax fee.
	 * @param _excluded address that don't pay tax fee.
	 * @param _status if the address is or not exclusive.
	 */

	function setExcluded(address _excluded, bool _status) external {
		require(
			artists[msg.sender] == msg.sender,
			"setExcluded revert: you're not an artist"
		);
		excludedListByArtist[msg.sender][_excluded] = _status;
	}

	// The following functions are overrides required by Solidity.

	function transferFrom(
		address _from,
		address _to,
		uint256 _tokenId
	) public override(ERC721, IERC721) {
		if (_to == marketplaceAddress) {
			_transfer(_from, _to, _tokenId);
			return;
		}

		require(
			_isApprovedOrOwner(_msgSender(), _tokenId),
			'ERC721: transfer caller is not owner nor approved'
		);

		address artist = royalties[_tokenId].artist;

		if (excludedListByArtist[artist][_from] == false) {
			uint256 taxFee = royalties[_tokenId].taxFee;
			_payTxFee(_from, artist, taxFee);
		}
		_transfer(_from, _to, _tokenId);
	}

	// ************************ //
	// *       private        * //
	// ************************ //

	function _payTxFee(address _from, address _artist, uint256 _taxFee) private {
		if (address(this) == _from) {
			return;
		}

		require(uni.balanceOf(_from) >= _taxFee, '_payTxFee: Insufficient tokens');
		uni.operatorSend(_from, _artist, _taxFee, '', '');
	}
}
