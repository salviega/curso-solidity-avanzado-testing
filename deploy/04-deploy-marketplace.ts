import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { networkConfig } from '../helper-hardhat-config'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

const deployMarketplace: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	// @ts-ignore
	const { getNamedAccounts, deployments, network } = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	log('----------------------------------------------------')
	log('---------------- Marketplace ----------------------')
	log('Deploying Marketplace contract and waiting for confirmations...')

	let uniContract: Contract = await ethers.getContractAt('UNI', deployer)
	let uniandinosNFTContract: Contract = await ethers.getContractAt(
		'UniandinosNFT',
		deployer
	)

	let args: any[] = [
		await uniContract.getAddress(), // _uniAddress
		await uniandinosNFTContract.getAddress() // _uniandinosNFTAddress
	]

	await deploy('Marketplace', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1
	})

	log('\n')
}

export default deployMarketplace
deployMarketplace.tags = ['all', 'Marketplace']
