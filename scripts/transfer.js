const { ethers } = require('hardhat')

async function transferFunds() {
	const [sender] = await ethers.getSigners()
	const receiverAddress = '0xE8e1543235e6C35C656ef0b28526C61571583f4B'
	const eth = '10'

	const balance = await sender.getBalance()
	const value = ethers.utils.parseEther(eth) // Amount you want to transfer

	if (balance.lt(value)) {
		console.log('You do not have sufficient funds in your Hardhat wallet.')
		return
	}

	const transaction = await sender.sendTransaction({
		to: receiverAddress,
		value: value
	})

	console.log('Successful transaction. Transaction hash:', transaction.hash)
}

transferFunds()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
