import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, DeployResult } from 'hardhat-deploy/types'
import { networkConfig } from '../helper-hardhat-config'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

const deployUniandinosNFT: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	// @ts-ignore
	const { getNamedAccounts, deployments, network } = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	log('----------------------------------------------------')
	log('---------------- UniandinosNFT ----------------------')
	log('Deploying UniandinosNFT contract and waiting for confirmations...')

	let uniContract: Contract = await ethers.getContractAt('UNI', deployer)

	let args: any[] = [
		'0x0000000000000000000000000000000000000000', // _marketplaceAddress
		await uniContract.getAddress(), // _uniAddress
		'Uniandinos NFTs store', // _name
		'UNS' // _symbol
	]

	await deploy('UniandinosNFT', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1
	})

	log('\n')
}

export default deployUniandinosNFT
deployUniandinosNFT.tags = ['all', 'UniandinosNFT']
