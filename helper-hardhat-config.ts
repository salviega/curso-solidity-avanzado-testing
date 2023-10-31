interface networkConfigItem {
	ethUsdPriceFeed?: string
	blockConfirmations?: number
}

interface networkConfigInfo {
	[key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
	hardhat: {},
	localhost: {
		blockConfirmations: 3
	},
	arbitrumGoerli: {
		blockConfirmations: 3
	},
	alfajores: {
		blockConfirmations: 3
	},
	mumbai: {
		blockConfirmations: 3
	},
	optimismGoerli: {
		blockConfirmations: 3
	},
	sepolia: {
		blockConfirmations: 3
	}
}

export const developmentChains: string[] = ['hardhat', 'localhost']
