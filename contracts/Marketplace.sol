// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './UNI.sol';
import './UniandinosNFT.sol';

/**
 * @title MarketPlace
 * @dev This contract allows to sell and buy NFTs
 * @notice The payment is made with UNI token (ERC777 tokens)
 *
 * @author [salviega]
 * contact [salviega6gmail.com, salviega.eth]
 * authorship [Detalles Adicionales sobre Contribuyentes o Reconocimientos, si es necesario]
 *
 * version 1.0
 * date 2023-11-08
 */

contract Marketplace is ReentrancyGuard, Ownable {
	using Strings for string;
	using Counters for Counters.Counter;

	Counters.Counter public itemCounter;
	Counters.Counter public tokenIdCounter;

	/* Contracts */

	UniandinosNFT public uniandinosNFT;
	UNI public uni;

	/* Storege */

	struct Item {
		uint256 itemId;
		uint256 price;
		bool sold;
		uint256 tokenId;
		address uniandinosNFTAddress;
		address uniAddress;
	}

	mapping(uint256 => Item) public items;

	/* Events */

	event Offerd(
		uint256 itemId,
		uint256 price,
		bool sold,
		uint256 tokenId,
		address uniandinosNFTAddress,
		address uniAddress
	);

	event Bought(
		uint256 itemId,
		uint256 price,
		bool sold,
		uint256 tokenId,
		address uniandinosNFTAddress,
		address uniAddress,
		address buyer
	);

	/** @notice Marketplace constructor
	 * @param _uniAddress the UNI contract address
	 */

	constructor(address _uniAddress, address _uniandinosNFTAddress) {
		uniandinosNFT = UniandinosNFT(_uniandinosNFTAddress);
		uni = UNI(_uniAddress);
	}

	// ************************ //
	// *      MarketPlace     * //
	// ************************ //

	/** @notice Sell an NFT
    @param _artist the artist address
    @param _tokenURI the token URI
    @param _price the price of the NFT
    @param _taxFee the tax fee of the NFT
   */

	function sellItem(
		address _artist,
		string calldata _tokenURI,
		uint _price,
		uint256 _taxFee
	) public onlyOwner {
		require(_artist != address(0), 'sellItem: Invalid artist address');
		require(_tokenURI.equal(''), 'sellItem: Invalid token URI');
		require(_price > 0, 'sellItem: Invalid price');
		require(_taxFee > 0 && _taxFee <= _price, 'sellItem: Invalid tax fee');

		uint256 tokenId = uniandinosNFT.safeMint(_artist, _tokenURI, _taxFee);

		itemCounter.increment();
		uint256 itemId = itemCounter.current();

		Item memory item = Item(
			itemId,
			_price,
			false,
			tokenId,
			address(uniandinosNFT),
			address(uni)
		);

		emit Offerd(
			item.itemId,
			item.price,
			item.sold,
			item.tokenId,
			item.uniandinosNFTAddress,
			item.uniAddress
		);
	}

	/** @notice Buy an NFT
    @param _itemId the item id
   */

	function buyItem(uint256 _itemId) public nonReentrant {
		require(
			_itemId > 0 && _itemId <= itemCounter.current(),
			"buyItem: Item don't exist"
		);
		require(!items[_itemId].sold, 'buyItem: Item already sold');
		require(
			uni.balanceOf(msg.sender) >= items[_itemId].price,
			'buyItem: Insufficient tokens'
		);

		uni.transferFrom(msg.sender, address(this), items[_itemId].price);

		uniandinosNFT.transferFrom(
			address(this),
			msg.sender,
			items[_itemId].tokenId
		);

		Item storage item = items[_itemId];
		item.sold = true;

		emit Bought(
			item.itemId,
			item.price,
			item.sold,
			item.tokenId,
			item.uniandinosNFTAddress,
			item.uniAddress,
			msg.sender
		);
	}

	// ************************ //
	// *  Getters y Setters   * //
	// ************************ //

	/** @notice sets the Uniandinos NFT contract address
    @param _newUniandinosNFTAddress the new UNIANDINOS NFT contract address
    @return address the new UNIANDINOS NFT contract address
   */

	function setUniandinosNFTAddress(
		address _newUniandinosNFTAddress
	) public onlyOwner returns (address) {
		uniandinosNFT = UniandinosNFT(_newUniandinosNFTAddress);

		return address(uniandinosNFT);
	}
}
