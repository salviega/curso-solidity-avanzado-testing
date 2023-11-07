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
	uni: UNI
	faucet: Faucet
	uniandinosNFT: UniandinosNFT
	marketplace: Marketplace
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

		// faucet = await ethers.getContractAt('Faucet', admin.address)
		// uniandinosNFT = await ethers.getContractAt('UniandinosNFT', admin.address)
		// marketplace = await ethers.getContractAt('Marketplace', admin.address)
	})

	it('get UNI contract', async () => {
		const { uni, faucet } = contracts
		console.log('Faucet deployed to:', await faucet.getAddress())
		console.log('UNI deployed to:', await uni.owner())

		// await cosmoContract.connect(owner1).buyTokens(ethers.utils.parseUnits('3', 'ether'), { value: ethers.utils.parseUnits('3', 'ether') })
	})

	// it('proposes, votes, waits, queues, and then executes', async () => {
	// 	// propose
	// 	const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [
	// 		NEW_STORE_VALUE
	// 	])
	// 	const proposeTx = await governor.propose(
	// 		[box.address],
	// 		[0],
	// 		[encodedFunctionCall],
	// 		PROPOSAL_DESCRIPTION
	// 	)

	// 	const proposeReceipt = await proposeTx.wait(1)
	// 	const proposalId = proposeReceipt.events![0].args!.proposalId
	// 	let proposalState = await governor.state(proposalId)
	// 	console.log(`Current Proposal State: ${proposalState}`)

	// 	await moveBlocks(VOTING_DELAY + 1)
	// 	// vote
	// 	const voteTx = await governor.castVoteWithReason(
	// 		proposalId,
	// 		voteWay,
	// 		reason
	// 	)
	// 	await voteTx.wait(1)
	// 	proposalState = await governor.state(proposalId)
	// 	assert.equal(proposalState.toString(), '1')
	// 	console.log(`Current Proposal State: ${proposalState}`)
	// 	await moveBlocks(VOTING_PERIOD + 1)

	// 	// queue & execute
	// 	// const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
	// 	const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
	// 	const queueTx = await governor.queue(
	// 		[box.address],
	// 		[0],
	// 		[encodedFunctionCall],
	// 		descriptionHash
	// 	)
	// 	await queueTx.wait(1)
	// 	await moveTime(MIN_DELAY + 1)
	// 	await moveBlocks(1)

	// 	proposalState = await governor.state(proposalId)
	// 	console.log(`Current Proposal State: ${proposalState}`)

	// 	console.log('Executing...')
	// 	console.log
	// 	const exTx = await governor.execute(
	// 		[box.address],
	// 		[0],
	// 		[encodedFunctionCall],
	// 		descriptionHash
	// 	)
	// 	await exTx.wait(1)
	// 	console.log((await box.retrieve()).toString())
	// })
})

async function deployContracts(): Promise<Contracts> {
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

	const faucet = await deployContract<Faucet>('Faucet', faucetArgs)

	// Deploy UniandinosNFT contract

	const uniandinosNFTArgs = [
		ethers.ZeroAddress, // Zero address for marketplace address initially
		uni.getAddress(),
		'Uniandinos NFTs store',
		'UNS'
	]

	const uniandinosNFT = await deployContract<UniandinosNFT>(
		'UniandinosNFT',
		uniandinosNFTArgs
	)

	// Deploy Marketplace contract

	const marketplaceArgs = [uni.getAddress(), uniandinosNFT.getAddress()]

	const marketplace = await deployContract<Marketplace>(
		'Marketplace',
		marketplaceArgs
	)

	// Return all deployed contracts
	return {
		uni,
		faucet,
		uniandinosNFT,
		marketplace
	}
}

async function deployContract<T>(
	contractName: string,
	args: any[]
): Promise<T> {
	const ContractFactory: ContractFactory = await ethers.getContractFactory(
		contractName
	)
	const contract = await ContractFactory.deploy(...args)
	return contract as unknown as T
}
