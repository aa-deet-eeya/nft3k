const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Accounts from hardhat node with mnemonic : "symptom bean awful husband dice accident crush tank sun notice club creek"
// (as mentioned in hardhat.config.js)
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

const MerkleRoot = merkleTreeWhiteList.getRoot();

function getWhitelistHexProofFromAddrs(addressToCheck) {
    const addressHash = keccak256(addressToCheck);
    const hexProof = merkleTreeWhiteList.getHexProof(addressHash);
    
    return hexProof;
}

module.exports = {
    getWhitelistHexProofFromAddrs,
    MerkleRoot
}
