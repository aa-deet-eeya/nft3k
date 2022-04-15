import React from 'react'
import Layout from '../layouts/index'
import {
	Article,
	ArticleContent,
	ArticleMedia,
} from '../components/layout/Article'
import ShopImg from '../assets/img/home1.gif'
import useMint from '../hooks/useMint'

export default function MintPage() {
	const {
		// increment,
		// decrement,
		// mintAmount,
		// amount,
		mint,
		price,
		remainingNFTs,
		connect,
		disconnect,
		isWalletConnected
	} = useMint()

	return (
		<Layout>
			<Article>
				<ArticleContent title="Mint a 3K NFT">
					<p className="text-center">
						Floor price at {price} $MATIC per NFT!
					</p>
					{/* <div className="flex justify-center">
						<button
							onClick={decrement}
							type="button"
							className="-mt-px text-white shadow-lg bg-secondary-400"
						>
							-
						</button>
						<div className="w-20 text-center"> {mintAmount} </div>
						<button
							onClick={increment}
							type="button"
							className="-mt-px text-white shadow-lg bg-secondary-400 no-underline"
						>
							+
						</button>
					</div> */}
					{/* <div className="bg-indigo-900 text-center py-4 lg:px-4">
						<div
							className="p-2 bg-indigo-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex"
							role="alert"
						>
							<span className="font-semibold mr-2 text-left flex-auto">
								Total $MATIC: {amount}
							</span>
						</div>
					</div> */}
					<div className="flex justify-center">
						{!isWalletConnected ? <button
							onClick={connect}
							type="submit"
							className="-mt-px text-white shadow-lg w-60 bg-secondary-400 no-underline"
						>
							Connect Wallet
						</button> :  <button
							onClick={disconnect}
							type="submit"
							className="-mt-px text-white shadow-lg w-60 bg-secondary-400 no-underline"
						>
							Disconnect Wallet
						</button>}
						&nbsp;&nbsp;&nbsp;&nbsp;
						<button
							onClick={mint}
							type="submit"
							className="-mt-px text-white shadow-lg w-60 bg-secondary-400 no-underline"
						>
							Mint
						</button>
					</div>
					<p className="text-center">
						Only <span className="font-bold">{remainingNFTs}</span> remaining!!!
					</p>
				</ArticleContent>
				<ArticleMedia>
					<img src={ShopImg} alt="Wild life" />
				</ArticleMedia>
			</Article>
		</Layout>
	)
}
