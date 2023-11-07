import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, DeployResult } from 'hardhat-deploy/types'
import { networkConfig } from '../helper-hardhat-config'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

const deployFaucet: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	// @ts-ignore
	const { getNamedAccounts, deployments, network } = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	log('----------------------------------------------------')
	log('--------------------- FAUCET -----------------------')
	log('Deploying Faucet contract and waiting for confirmations...')

	let uniContract: Contract = await ethers.getContractAt('UNI', deployer)

	let args: any[] = [
		await uniContract.getAddress(), // _uniAddress
		ethers.parseEther('10').toString(), // _maxSupply
		300, // _timeoutLimit
		'Max 10 tokens per transaction' // _messageWithdrawRequire
	]

	let FaucetContract: DeployResult = await deploy('Faucet', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1
	})

	log('----------------------------------------------------')
	log('Setting up the faucet owner...')
	log('\n')

	let transferFaucetOwnershipTx = await uniContract.transferOwnership(
		FaucetContract.address
	)

	await transferFaucetOwnershipTx.wait(1)

	log('Faucet contract is the new owner of the Uni contract.')
	log('\n')
}

export default deployFaucet
deployFaucet.tags = ['all', 'Faucet']
