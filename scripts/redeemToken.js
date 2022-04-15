const hardhat = require("hardhat");
const { ethers } = hardhat;
const { getWhitelistHexProofFromAddrs } = require('../utils/MerkleProof.js')
const VOUCHER_LIST = require('../voucher.json');

let CONTRACT_ADDRESS = "0x608F04E942C35Db8A6573C5B0d42a1Bf5b1a0157"

let tokenId = 2

const main = async () => {
    const accounts = await ethers.getSigners()
    const addrs = (accounts[0]).address
    const nft3kContract = await ethers.getContractAt("Nft3kContract", CONTRACT_ADDRESS);
    const voucher = VOUCHER_LIST[tokenId];

    console.log("Live Address:\t" + nft3kContract.address);
    console.log("Account : " + addrs)
    console.log("Voucher : " + JSON.stringify(voucher))

    const tx = await nft3kContract
        .redeem(addrs, voucher, getWhitelistHexProofFromAddrs(addrs), { from: addrs, value: ethers.constants.WeiPerEther.div(100) });

    console.log(tx);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });