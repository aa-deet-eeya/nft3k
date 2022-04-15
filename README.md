# nft3k
3k NFTs for Interview Assessment Test

The goal is to create a simple NFT collection with Lazy Minting and 5% royalty on secondary sales. This has been implemented with proper tests and a client to let users mint the NFTs. 

## How to run?
1. Clone and `npm install` in the directory,
2. Run `npx hardhat node` to run a local node,
3. Run `npm run test` to run the test suite,
4. To deploy the contracts use `npx hardhat run --network mumbai scripts/deploy.js` to deploy in mumbai network
5. To run the client, first `npm install` inside the /client directory
6. Then `npm run start` to start the frontend in dev mode
7. To build for prod use `npm run build`

## What could've been done better?

1. Tests could've been more extensive
2. The Mumbai testnet transaction freezes sometimes when minted using the front-end (Incase it happens you'll have to change the nounce and do a transaction, https://www.reddit.com/r/0xPolygon/comments/r80pe4/comment/hn2x7b2/?utm_source=share&utm_medium=web2x&context=3)
3. The voucher distribution could've been better, possibly using a dedicated backend.
4. Custom backend with proper proxy to show the metadata of only minted NFTs.
