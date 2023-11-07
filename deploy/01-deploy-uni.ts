import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { networkConfig } from '../helper-hardhat-config'

const { singletons } = require('@openzeppelin/test-helpers')

const deployUni: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	// @ts-ignore
	const { getNamedAccounts, deployments, network } = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	// Desplegar el registro ERC1820
	await singletons.ERC1820Registry(deployer)

	log('----------------------------------------------------')
	log('---------------------  UNI -------------------------')
	log('Deploying UNI contract and waiting for confirmations...')

	let args: any[] = [
		'Uniandino', // _name
		'UNI' // _symbol
	]

	await deploy('UNI', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1
	})

	log('\n')
}

export default deployUni
deployUni.tags = ['all', 'UNI']
