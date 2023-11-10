import { ethers } from 'hardhat'
import { assert, expect } from 'chai'

import { moveTime } from '../utils/move-time'
import { ContractFactory, MaxUint256 } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

interface Accounts {
	admin: SignerWithAddress
	artist: SignerWithAddress
	owner1: SignerWithAddress
	owner2: SignerWithAddress
}

interface Contracts {
	uni: any
	faucet: any
	uniandinosNFT: any
	marketplace: any
}

describe('Marketplace Flow', async function () {
	let accounts: Accounts
	let contracts: Contracts

	const taxFee: bigint = ethers.parseUnits('1', 'ether')

	beforeEach(async function () {
		const signers = await ethers.getSigners()

		accounts = {
			admin: signers[0],
			artist: signers[1],
			owner1: signers[2],
			owner2: signers[3]
		}

		contracts = await deployContracts()

		const { uni, faucet, uniandinosNFT, marketplace } = contracts

		const uniAddress = await uni.getAddress()
		const faucetAddress = await faucet.getAddress()
		const uniandinosNFTAddress = await uniandinosNFT.getAddress()
		const marketplaceAddress = await marketplace.getAddress()

		let transferFaucetOwnershipTx = await uni.transferOwnership(faucetAddress)
		await transferFaucetOwnershipTx.wait(1)

		let setMarketplaceAddressTx = await uniandinosNFT.setMarketplaceAddress(
			marketplaceAddress
		)
		await setMarketplaceAddressTx.wait(1)

		let setUniandinosNFTAddressTx = await marketplace.setUniandinosNFTAddress(
			uniandinosNFTAddress
		)
		await setUniandinosNFTAddressTx.wait(1)

		let transferMarketplaceOwnershipTx = await uniandinosNFT.transferOwnership(
			marketplaceAddress
		)
		await transferMarketplaceOwnershipTx.wait(1)
	})

	it('Faucet should be the owner of the UNI contract', async () => {
		// Arrange
		const { admin } = accounts
		const { uni, faucet } = contracts

		// Act
		const faucetAddress: string = await faucet.getAddress()
		const uniOwner: string = await uni.owner()

		// Assert
		assert.equal(faucetAddress, uniOwner)
		assert.notEqual(admin.address, uniOwner)
	})

	it('Can only withdraw in the period time', async () => {
		// Arrange
		const { owner1 } = accounts
		const { uni, faucet } = contracts

		const tokensToWithdrawHappyPath: bigint = ethers.parseEther('10')
		const tokensToWithdrawSadPath: bigint = ethers.parseEther('11')

		// Act
		const owner1BalanceBefore: bigint = await uni.balanceOf(owner1.address)
		const withdrawTx = await faucet
			.connect(owner1)
			.withdraw(tokensToWithdrawHappyPath)
		await withdrawTx.wait(1)

		// Assert: owner1 balance should be increased by 10 UNI
		assert.equal(await uni.balanceOf(owner1.address), tokensToWithdrawHappyPath)
		console.log('✅ owner1 balance should be increased by 10 UNI')

		// Assert: owner1 should not be able to withdraw more than 10 UNI
		await expect(
			faucet.connect(owner1).withdraw(tokensToWithdrawHappyPath)
		).to.be.revertedWith('Withdrawal unavailable: still within timeout period.')
		console.log('✅ owner1 should not be able to withdraw more than 10 UNI')

		// Act
		await moveTime(301)
		await faucet.connect(owner1).withdraw(tokensToWithdrawHappyPath)

		// Assert: owner1 balance should be increased by 20 UNI
		assert.equal(
			await uni.balanceOf(owner1.address),
			tokensToWithdrawHappyPath * BigInt(2)
		)
		console.log('✅ owner1 balance should be increased by 20 UNI')

		// Act
		await moveTime(301)

		// Assert: owner1 should not be able to withdraw more than 11 UNI
		await expect(
			faucet.connect(owner1).withdraw(tokensToWithdrawSadPath)
		).to.be.revertedWith('Max 10 tokens per transaction')
		console.log('✅ owner1 should not be able to withdraw more than 11 UNI')
	})

	it('set max supply also sets message withdraw require', async () => {
		// Arrange
		const { admin } = accounts
		const { uni, faucet } = contracts

		const tokensToWithdraw: bigint = ethers.parseEther('30')
		const newMaxSupply: bigint = ethers.parseEther('20')

		// Act
		await faucet.setMaxSupply(newMaxSupply)

		// Assert: max supply should be set to 20 UNI
		assert.equal(await faucet.maxSupply(), newMaxSupply)
		console.log('✅ Max supply should be set to 20 UNI')

		// Act
		await moveTime(301)

		// Assert
		await expect(
			faucet.connect(admin).withdraw(tokensToWithdraw)
		).to.be.revertedWith('Max 20 tokens per transaction')
		console.log('✅ admin should not be able to withdraw more than 20 UNI')
	})

	it('Sell NFT', async () => {
		// Arrange
		const { admin, artist, owner1 } = accounts
		const { uni, faucet, marketplace, uniandinosNFT } = contracts

		let iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress

		const art: string = 'https://ip'
		const price: bigint = ethers.parseEther('5')

		// Act
		const tokenId: bigint = await uniandinosNFT.tokenIdCounter()
		await marketplace
			.connect(admin)
			.sellItem(artist.address, art, price, taxFee)

		// Assert
		expect(await uniandinosNFT.ownerOf(tokenId)).to.equal(
			await marketplace.getAddress()
		)
		console.log('✅ NFT should be owned by marketplace')

		// Act
		const currentIteamId: bigint = await marketplace.itemCounter()

		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		// Assert
		expect(iteamId).to.equal(currentIteamId)
		console.log('✅ Item id should be equal to current item id')
		expect(itemPrice).to.equal(price)
		console.log('✅ Item price should be equal to price')
		expect(itemSold).to.equal(false)
		console.log('✅ Item sold should be false')
		expect(itemTokenId).to.equal(tokenId)
		console.log('✅ Item tokenId should be equal to tokenId')
		expect(itemUniandinosNFTAddress).to.equal(await uniandinosNFT.getAddress())
		console.log('✅ Item uniandinosNFTAddress should be equal to uniandinosNFT')
		expect(ItemUniAddress).to.equal(await uni.getAddress())
		console.log('✅ Item uniAddress should be equal to uni')
	})

	it('Buy NFT', async () => {
		// Arrange
		const { admin, artist, owner1 } = accounts
		const { uni, faucet, marketplace, uniandinosNFT } = contracts

		let iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress

		const art: string = 'https://ip'
		const price: bigint = ethers.parseEther('5')

		// Act
		const tokenId: bigint = await uniandinosNFT.tokenIdCounter()
		await marketplace
			.connect(admin)
			.sellItem(artist.address, art, price, taxFee)

		const currentIteamId: bigint = await marketplace.itemCounter()

		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		await faucet.connect(owner1).withdraw(price)

		await uni
			.connect(owner1)
			.approve(await marketplace.getAddress(), MaxUint256)

		await marketplace.connect(owner1).buyItem(iteamId)
		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		// Assert
		expect(await uniandinosNFT.ownerOf(tokenId)).to.equal(owner1.address)
		console.log('✅ NFT should be owned by owner1')
		expect(itemSold).to.equal(true)
		console.log('✅ Item sold should be true')
	})

	it('Transfer NFT and pay tax', async () => {
		// Arrange
		const { admin, artist, owner1, owner2 } = accounts
		const { uni, faucet, marketplace, uniandinosNFT } = contracts

		let iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress

		const art: string = 'https://ip'
		const price: bigint = ethers.parseEther('5')

		// Act
		const tokenId: bigint = await uniandinosNFT.tokenIdCounter()
		await marketplace
			.connect(admin)
			.sellItem(artist.address, art, price, taxFee)

		const currentIteamId: bigint = await marketplace.itemCounter()

		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		await faucet.connect(owner1).withdraw(price + taxFee)

		await uni
			.connect(owner1)
			.approve(await marketplace.getAddress(), MaxUint256)

		await marketplace.connect(owner1).buyItem(iteamId)
		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		// Act
		const isExcluded = await uniandinosNFT.isExcluded(
			artist.address,
			owner2.address
		)

		// Assert
		expect(isExcluded).to.equal(false)
		console.log('✅ artist should not be excluded')

		// Act
		await uniandinosNFT.connect(owner1).approve(owner2.address, tokenId)
		await uni.connect(owner1).approve(uniandinosNFT, taxFee)

		await uniandinosNFT
			.connect(owner1)
			.transferFrom(owner1.address, owner2.address, tokenId)

		// Assert
		expect(await uniandinosNFT.ownerOf(tokenId)).to.equal(owner2.address)
		console.log('✅ NFT should be owned by owner2')

		// act
		;[
			iteamId,
			itemPrice,
			itemSold,
			itemTokenId,
			itemUniandinosNFTAddress,
			ItemUniAddress
		] = await marketplace.items(currentIteamId)

		expect(await uni.balanceOf(artist.address)).to.equal(taxFee)
		console.log('✅ owner2 balance should be equal to taxFee')
		expect(await uni.balanceOf(owner1.address)).to.equal(0)
		console.log('✅ owner1 balance should be 0')
	})
})

async function deployContracts() {
	// Deploy UNI contract

	const uniArgs = ['Uniandino', 'UNI', []]
	const uni = await deployContract('UNI', uniArgs)

	// Deploy Faucet contract

	const faucetArgs = [
		uni.getAddress(),
		ethers.parseEther('10').toString(),
		300,
		'Max 10 tokens per transaction'
	]

	const faucet = await deployContract('Faucet', faucetArgs)

	// Deploy UniandinosNFT contract

	const uniandinosNFTArgs = [
		ethers.ZeroAddress, // Zero address for marketplace address initially
		uni.getAddress(),
		'Uniandinos NFTs store',
		'UNS'
	]

	const uniandinosNFT = await deployContract('UniandinosNFT', uniandinosNFTArgs)

	// Deploy Marketplace contract

	const marketplaceArgs = [uni.getAddress(), uniandinosNFT.getAddress()]

	const marketplace = await deployContract('Marketplace', marketplaceArgs)

	// Return all deployed contracts
	return {
		uni,
		faucet,
		uniandinosNFT,
		marketplace
	}
}

async function deployContract(contractName: string, args: any[]) {
	const ContractFactory: ContractFactory = await ethers.getContractFactory(
		contractName
	)
	const contract = await ContractFactory.deploy(...args)
	return contract
}
