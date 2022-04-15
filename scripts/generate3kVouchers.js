const hardhat = require("hardhat");
const { LazyMinter } = require('../utils/LazyMinter.js')
const { MerkleRoot } = require('../utils/MerkleProof.js')
const fs = require('fs');
const { ethers } = hardhat;

const SIGNING_DOMAIN_NAME = "Nft3k-Voucher"
const SIGNING_DOMAIN_VERSION = "1"
const CHAIN_ID = 80001
let CONTRACT_ADDRESS = "0x608F04E942C35Db8A6573C5B0d42a1Bf5b1a0157"

const createVoucher = async (
    tokenId,
    minPrice,
    signer
) => {
    const voucher = { 
        tokenId, 
        uri: `ipfs://QmWytxVvhDWpcJVAfLFRPFA5PeChEQqqyC7XdXYrRbs6xS/${tokenId}.json`, 
        minPrice 
    }

    const types = {
        NFT3kVoucher: [
          {name: "tokenId", type: "uint256"},
          {name: "minPrice", type: "uint256"},
          {name: "uri", type: "string"},  
        ]
    }

    const domain = {
        name: SIGNING_DOMAIN_NAME,
        version: SIGNING_DOMAIN_VERSION,
        verifyingContract: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
    }

    const signature = await signer._signTypedData(domain, types, voucher)

    return {
        ...voucher,
        signature,
    }
}

let voucherList = [];
const main = async () => {
    const signers = await ethers.getSigners()
    const minter = signers[0]
  
    // console.log('Deploying Contract');
    // let factory = await ethers.getContractFactory("Nft3kContract", minter)
    // const contract = await factory.deploy(minter.address, MerkleRoot)
    // CONTRACT_ADDRESS = contract.address;
    // console.log(contract.address)
    // console.log('Contract Deployed');

    // fs.writeFile("./contract.json", JSON.stringify(contract), 'utf8', function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    
    //     console.log("The Contract instance was saved!");
    // }); 

    let j = [];
    for(i=0; i<3000; i++)
        j[i]=i
    
    // const lazyMinter = new LazyMinter({ contract, signer: minter })
    for(const i of j) {
        // console.log(`Creating ${i} Voucher`)
        // const voucher = await lazyMinter.createVoucher(i, `ipfs://QmWytxVvhDWpcJVAfLFRPFA5PeChEQqqyC7XdXYrRbs6xS/${i}.json`)
        const voucher = await createVoucher(
            i,
            ethers.constants.WeiPerEther.div(100) , //1 matic
            minter
        )
        // console.log(`Voucher ${i} created`)
        voucherList.push(voucher);
    }

    
}

main()
  .then(() => {
    fs.writeFileSync("./voucher.json", JSON.stringify(voucherList), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    
        console.log("The Voucher was saved!");
    }); 
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });