import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'dotenv/config'
import 'hardhat-celo'
import 'hardhat-deploy'

import { CustomHardhatConfig } from './models/custom-hardhat-config.model'

require('dotenv').config()

const { POLYGONSCAN_API_KEY, PRIVATE_KEY } = process.env

const SOLC_SETTINGS = {
	optimizer: {
		enabled: true,
		runs: 200
	}
	// viaIR: true
}

const defaultNetwork = 'hardhat' // change the defaul network if you want to deploy onchain
const config: CustomHardhatConfig = {
	defaultNetwork,
	networks: {
		hardhat: {
			chainId: 1337,
			allowUnlimitedContractSize: true
		},
		localhost: {
			chainId: 1337,
			allowUnlimitedContractSize: true
		},
		mumbai: {
			chainId: 80001,
			accounts: [PRIVATE_KEY || ''],
			url: 'https://rpc-mumbai.maticvigil.com',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		}
	},
	etherscan: {
		apiKey: {
			polygonMumbai: POLYGONSCAN_API_KEY || ''
		}
	},
	namedAccounts: {
		deployer: {
			default: 0,
			1: 0
		}
	},
	solidity: {
		compilers: [
			{
				version: '0.8.20',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.8.19',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.8.7',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.7.0',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.6.6',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.4.24',
				settings: SOLC_SETTINGS
			}
		]
	},
	mocha: {
		timeout: 200000
	}
}

export default config
