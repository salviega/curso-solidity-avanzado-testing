import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'dotenv/config'
import 'hardhat-celo'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import { CustomHardhatConfig } from './models/custom-hardhat-config.model'

require('dotenv').config()

const {
	ARBITRUM_GOERLI_RPC_URL,
	ARBITRUMSCAN_API_KEY,
	CELOSCAN_API_KEY,
	OPTIMISMN_GOERLI_RPC_URL,
	OPTIMISMNSCAN_API_KEY,
	POLYGONSCAN_API_KEY,
	PRIVATE_KEY,
	SEPORLIA_RPC_URL,
	SEPOLIASCAN_API_KEY
} = process.env

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
		arbitrumGoerli: {
			chainId: 421613,
			accounts: [PRIVATE_KEY || ''],
			url: ARBITRUM_GOERLI_RPC_URL || '',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		},
		alfajores: {
			chainId: 44787,
			accounts: [PRIVATE_KEY || ''],
			url: 'https://alfajores-forno.celo-testnet.org',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		},
		mumbai: {
			chainId: 80001,
			accounts: [PRIVATE_KEY || ''],
			url: 'https://rpc-mumbai.maticvigil.com',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		},
		optimismGoerli: {
			chainId: 420,
			accounts: [PRIVATE_KEY || ''],
			url: OPTIMISMN_GOERLI_RPC_URL || '',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		},
		sepolia: {
			chainId: 11155111,
			accounts: [PRIVATE_KEY || ''],
			url: SEPORLIA_RPC_URL || '',
			gas: 6000000, // Increase the gas limit
			gasPrice: 10000000000 // Set a custom gas price (in Gwei, optional)
		},
		coverage: {
			url: 'http://127.0.0.1:8555' // Coverage launches its own ganache-cli client
		}
	},
	etherscan: {
		apiKey: {
			arbitrumGoerli: ARBITRUMSCAN_API_KEY || '',
			alfajores: CELOSCAN_API_KEY || '',
			optimismnGoerli: OPTIMISMNSCAN_API_KEY || '',
			polygonMumbai: POLYGONSCAN_API_KEY || '',
			sepolia: SEPOLIASCAN_API_KEY || ''
		}
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		excludeContracts: ['Migrations'], // Exclude specific contracts if needed
		src: './contracts' // Directory containing the contracts
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
