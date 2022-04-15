import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../layouts/index'
import {
	Article,
	ArticleContent,
	ArticleMedia,
} from '../components/layout/Article'
import IndexImg from '../assets/img/home.gif'

export default function IndexPage() {
	return (
		<Layout>
			<Article>
				<ArticleContent title="3K NFTs">
					<p className="text-justify">
						A generic 3K NFT Collection made on Polygon testnet as an interview assesment.
					</p>
					<p className="text-justify">
						This is the main frontend for the minting of the NFTs. The NFTs are lazy minted
						which basically issues nft token vouchers to be redeemed by the end users and
						it's ideally done using a backend, but for this simple implementation we use
						just the frontend and the blockchain instead of a deadicated backend.
					</p>
					<div className="flex justify-center">
						<button
							className="-mt-px text-white shadow-lg bg-secondary-400 no-underline"
							type="submit"
						>
							<Link to="/shop" className="no-underline">
								Mint Some NFTs
							</Link>
						</button>
					</div>
				</ArticleContent>
				<ArticleMedia>
					<img src={IndexImg} alt="Wild life" />
				</ArticleMedia>
			</Article>
		</Layout>
	)
}
