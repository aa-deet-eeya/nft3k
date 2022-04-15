const { expect } = require("chai");
const hardhat = require("hardhat");
const { ethers } = hardhat;
const { LazyMinter } = require('../utils/LazyMinter.js')
const { getWhitelistHexProofFromAddrs, MerkleRoot } = require('../utils/MerkleProof.js')

async function deploy(redeemerId = 1) {
  const signers = await ethers.getSigners()
  const minter = signers[0]
  const redeemer = signers[redeemerId]

  let factory = await ethers.getContractFactory("Nft3kContract", minter)
  const contract = await factory.deploy(minter.address, MerkleRoot)

  // the redeemerContract is an instance of the contract that's wired up to the redeemer's signing key
  const redeemerFactory = factory.connect(redeemer)
  const redeemerContract = redeemerFactory.attach(contract.address)

  return {
    minter,
    redeemer,
    contract,
    redeemerContract,
  }
}

describe("Nft3kContract", function() {

  it("Should deploy", async function() {
    const signers = await ethers.getSigners();
    const minter = signers[0].address;

    const LazyNFT = await ethers.getContractFactory("Nft3kContract");
    const lazynft = await LazyNFT.deploy(minter, MerkleRoot);
    await lazynft.deployed();
  });

  /**
   *  LAZY MINTING FUNCTIONAITY
   */

  it("Should redeem an NFT from a signed voucher", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)
    
    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId);
  });

  it("Should fail to redeem an NFT that's already been claimed", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId);

    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.be.revertedWith('ERC721: token already minted')
  });

  it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const signers = await ethers.getSigners()
    const rando = signers[signers.length-1];
    
    const lazyMinter = new LazyMinter({ contract, signer: rando })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should fail to redeem an NFT voucher that's been modified", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const signers = await ethers.getSigners()
    const rando = signers[signers.length-1];
    
    const lazyMinter = new LazyMinter({ contract, signer: rando })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
    voucher.tokenId = 2

    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should fail to redeem an NFT voucher with an invalid signature", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const signers = await ethers.getSigners()
    const rando = signers[signers.length-1];
    
    const lazyMinter = new LazyMinter({ contract, signer: rando })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

    const dummyData = ethers.utils.randomBytes(128)
    voucher.signature = await minter.signMessage(dummyData)

    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)
    
    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should redeem if payment is >= minPrice", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)
    console.log(voucher)


    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof, { value: minPrice }))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId)
  })

  it("Should fail to redeem if payment is < minPrice", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    const payment = minPrice.sub(10000)
    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof, { value: payment }))
      .to.be.revertedWith('Insufficient funds to redeem')
  })

  it("Should make payments available to minter for withdrawal", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    
    // the payment should be sent from the redeemer's account to the contract address
    await expect(await redeemerContract.redeem(redeemer.address, voucher, merkleProof, { value: minPrice }))
      .to.changeEtherBalances([redeemer, contract], [minPrice.mul(-1), minPrice]) 

    // minter should have funds available to withdraw
    expect(await contract.availableToWithdraw()).to.equal(minPrice)

    // withdrawal should increase minter's balance
    await expect(await contract.withdraw())
      .to.changeEtherBalance(minter, minPrice)

    // minter should now have zero available
    expect(await contract.availableToWithdraw()).to.equal(0)
  })

  /**
   *  WHITELISTING FUNCTIONALITY
   */
   it("Should fail to redeem an NFT for redeemer who isn't in the whitelist", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy(10)

    const lazyMinter = new LazyMinter({ contract, signer: minter })
    const voucher = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

    const merkleProof = getWhitelistHexProofFromAddrs(redeemer.address)

    await expect(redeemerContract.redeem(redeemer.address, voucher, merkleProof))
      .to.be.revertedWith('Redeemer not in Whitelist')
  });
});