import React from 'react'
import Web3 from 'web3'
import { toast } from 'react-toastify'
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

const VOUCHER_LIST = require('./voucher.json');

const NFT_PRICE = "0.01"
const CHAIN_ID = 80001
const CONTRACT_ADDRS = "0x608F04E942C35Db8A6573C5B0d42a1Bf5b1a0157"



function getWhitelistHexProofFromAddrs(addressToCheck) {
	// Same as utils/MerkleProof.js accounts
	let whitelistAddress = [
		'0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // 1st acc
		'0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // 2nd acc
		'0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', // 3rd acc
		'0x90f79bf6eb2c4f870365e785982e1f101e93b906', // 4th acc
		'0x15d34aaf54267db7d7c367839aaf71a00a2c6a65', // 5th acc
		'0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc', // 6th acc
	]

	const leafNodesWhitelist = whitelistAddress.map(keccak256);
	const merkleTreeWhiteList = new MerkleTree(leafNodesWhitelist, keccak256, { sortPairs: true });
	const addressHash = keccak256(addressToCheck);
	const hexProof = merkleTreeWhiteList.getHexProof(addressHash);

	return hexProof;
}

const useMint = () => {
	const web3 = new Web3(Web3.givenProvider)
	// const [mintAmount, setMintAmount] = React.useState(0)
	const [isWrongChain, setIsWrongChain] = React.useState(false)
	const [isWalletConnected, setIsWalletConnected] = React.useState(false)
	const [remainingNFTs, setRemainingNFTs] = React.useState(0)

	const nft3kContract = new web3.eth.Contract(
		// eslint-disable-next-line global-require
		require('./Nft3kContract.json'),
		CONTRACT_ADDRS
	)

	const disconnect = async () => {
		setIsWalletConnected(false);
		window.location.reload();
	}

	const connect = async () => {
		try {
			if (!(window.ethereum && window.ethereum.isMetaMask)) {
				throw Error('Metamask not installed!!!')
			}

			const connect = window.ethereum.request({ method: 'eth_requestAccounts' })

			await toast.promise(
				connect,
				{
					pending: 'Connecting to Wallet !!!',
					success: 'Successfully wallet connected !!!',
					error: 'Oops! Could not Connect to Wallet !!',
				},
				{
					position: 'bottom-right',
					draggable: true,
				}
			)

			setIsWalletConnected(true);

		} catch (error) {
			console.log(error)
			toast.error(error?.message || 'Could not connect the wallet', {
				position: 'bottom-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
			setIsWalletConnected(false);
		}
	}

	React.useEffect(() => {
		; (async () => {
			const chainId = await web3.eth.getChainId()

			if (isWalletConnected && chainId !== CHAIN_ID) {
				setIsWrongChain(true)
				toast.error('Wrong Network selected!!!', {
					position: 'bottom-right',
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				})
			} else {
				const sold = await nft3kContract.methods.totalSupply().call()
				setRemainingNFTs(3000 - sold)
				setIsWrongChain(false)
			}
		})()
	})

	// const increment = () => mintAmount < 20 && setMintAmount(mintAmount + 1)
	// const decrement = () => mintAmount > 0 && setMintAmount(mintAmount - 1)

	// const amount = (NFT_PRICE * mintAmount).toString()

	const mint = async () => {
		try {
			if (!isWalletConnected) {
				throw Error('Please Connect Wallet')
			}

			// if (mintAmount === 0) {
			// 	throw Error('Cannot mint zero NFTs')
			// }

			const chainId = await web3.eth.getChainId()
			const accounts = await web3.eth.getAccounts()


			if (chainId === CHAIN_ID) {
				const supply = await nft3kContract.methods.totalSupply().call()
				setRemainingNFTs(3000 - supply);
				const voucher = VOUCHER_LIST[supply];
				console.log(voucher)

				// eslint-disable-next-line camelcase
				const mint_tx = nft3kContract.methods
					.redeem(accounts[0], voucher, getWhitelistHexProofFromAddrs(accounts[0]))
					.send({ from: accounts[0]
						// , value: Web3.utils.toWei(new web3.utils.BN(voucher.minPrice.hex), 'wei') 
					})


				await toast.promise(
					mint_tx,
					{
						pending: 'Mintint NFT !!!',
						success: 'Successfully NFT minted !!!',
						error: 'Oops! Could not mint NFT !!',
					},
					{
						position: 'bottom-right',
						draggable: true,
					}
				)
			} else {
				throw Error('Wrong Network!!! Please connect to Avalance network')
			}
		} catch (error) {
			console.log(error)
			toast.error(error?.message || 'Could not connect Mint', {
				position: 'bottom-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
		}
	}

	return {
		// increment,
		// decrement,
		// mintAmount,
		// amount,
		mint,
		price: NFT_PRICE,
		remainingNFTs,
		isWrongChain,
		connect,
		disconnect,
		isWalletConnected
	}
}

export default useMint
