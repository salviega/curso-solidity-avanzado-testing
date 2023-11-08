import { Faucet, Marketplace, UNI, UniandinosNFT } from '../typechain-types'
import { deployments, ethers } from 'hardhat'
import { assert, expect } from 'chai'

import { moveBlocks } from '../utils/move-blocks'
import { moveTime } from '../utils/move-time'
import { ContractFactory } from 'ethers'
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
	})

	it.skip('Faucet should be the owner of the UNI contract', async () => {
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

		const owner1BalanceBefore: bigint = await uni.balanceOf(owner1.address)

		// Act
		const withdrawTx = await faucet
			.connect(owner1)
			.withdraw(tokensToWithdrawHappyPath)
		await withdrawTx.wait(1)

		// Assert
		assert.equal(await uni.balanceOf(owner1.address), tokensToWithdrawHappyPath)

		await expect(
			faucet.connect(owner1).withdraw(tokensToWithdrawHappyPath)
		).to.be.revertedWith('Withdrawal unavailable: still within timeout period.')

		await moveTime(301)

		await faucet.connect(owner1).withdraw(tokensToWithdrawHappyPath)

		assert.equal(
			await uni.balanceOf(owner1.address),
			tokensToWithdrawHappyPath * BigInt(2)
		)

		await moveTime(301)

		await expect(
			faucet.connect(owner1).withdraw(tokensToWithdrawSadPath)
		).to.be.revertedWith('Max 10 tokens per transaction')
	})
})

async function deployContracts() {
	// Deploy UNI contract

	const uniArgs = ['Uniandino', 'UNI', []]
	const uni = await deployContract<UNI>('UNI', uniArgs)

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

async function deployContract<T>(contractName: string, args: any[]) {
	const ContractFactory: ContractFactory = await ethers.getContractFactory(
		contractName
	)
	const contract = await ContractFactory.deploy(...args)
	return contract
}
