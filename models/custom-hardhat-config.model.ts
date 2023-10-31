import { HardhatUserConfig } from 'hardhat/config'

interface Etherscan {
	etherscan: { apiKey: string | undefined }
}

interface GasReporter {
	gasReporter: {
		enabled: boolean
		currency: string
		outputFile: string
		excludeContracts: string[]
		src: string
	}
}

interface NamedAccounts {
	namedAccounts: {
		[name: string]: {
			default: number
			[networkId: number]: number
		}
	}
}

export interface CustomHardhatConfig
	extends HardhatUserConfig,
		Etherscan,
		GasReporter,
		NamedAccounts {}
