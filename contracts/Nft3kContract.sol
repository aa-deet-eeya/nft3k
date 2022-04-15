//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // required to accept structs as function parameters

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Nft3kContract is ERC721URIStorage, EIP712, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  string private constant SIGNING_DOMAIN = "Nft3k-Voucher";
  string private constant SIGNATURE_VERSION = "1";
  bytes32 private WHITELIST_ROOT;

  mapping (address => uint256) pendingWithdrawals;

  constructor(address payable minter, bytes32 _merkleRoot)
    ERC721("NFT3k", "N3K") 
    EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
      _setupRole(MINTER_ROLE, minter);
      WHITELIST_ROOT = _merkleRoot;
    }

  /**
   *   ~~~~ CORE LAZY MINTING NFT CODE ~~~~
   */

  /// @notice A signed voucher thar can be redeemed for a real NFT using the redeem function.
  struct NFT3kVoucher {
    uint256 tokenId;
    uint256 minPrice;
    string uri;
    bytes signature;
  }


  /// @notice Redeems an NFT3kVoucher for an actual NFT, creating it in the process.
  /// @param redeemer The address of the account which will receive the NFT upon success.
  /// @param voucher A signed NFT3kVoucher that describes the NFT to be redeemed.
  function redeem(address redeemer, NFT3kVoucher calldata voucher, bytes32[] memory _proof) public payable returns (uint256) {
    address signer = _verify(voucher);

    require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");
    require(msg.value >= voucher.minPrice, "Insufficient funds to redeem");
    require(_whitelistVerify(redeemer, _proof), "Redeemer not in Whitelist");

    _mint(signer, voucher.tokenId);
    _setTokenURI(voucher.tokenId, voucher.uri);
    _transfer(signer, redeemer, voucher.tokenId);

    pendingWithdrawals[signer] += msg.value;

    return voucher.tokenId;
  }

  /// @notice Transfers all pending withdrawal balance to the caller. Reverts if the caller is not an authorized minter.
  function withdraw() public {
    require(hasRole(MINTER_ROLE, msg.sender), "Only authorized minters can withdraw");
    
    // IMPORTANT: casting msg.sender to a payable address is only safe if ALL members of the minter role are payable addresses.
    address payable receiver = payable(msg.sender);

    uint amount = pendingWithdrawals[receiver];

    pendingWithdrawals[receiver] = 0;
    receiver.transfer(amount);
  }

  /// @notice Retuns the amount of Ether available to the caller to withdraw.
  function availableToWithdraw() public view returns (uint256) {
    return pendingWithdrawals[msg.sender];
  }

  /// @notice Returns a hash of the given NFT3kVoucher, prepared using EIP712 typed data hashing rules.
  /// @param voucher An NFT3kVoucher to hash.
  function _hash(NFT3kVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFT3kVoucher(uint256 tokenId,uint256 minPrice,string uri)"),
      voucher.tokenId,
      voucher.minPrice,
      keccak256(bytes(voucher.uri))
    )));
  }

  /// @notice Returns the chain id of the current blockchain.
  /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
  ///  the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
  function getChainID() external view returns (uint256) {
    uint256 id;
    assembly {
        id := chainid()
    }
    return id;
  }

  /// @notice Verifies the signature for a given NFT3kVoucher, returning the address of the signer.
  /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
  /// @param voucher An NFT3kVoucher describing an unminted NFT.
  function _verify(NFT3kVoucher calldata voucher) internal view returns (address) {
    bytes32 digest = _hash(voucher);
    return ECDSA.recover(digest, voucher.signature);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override (AccessControl, ERC721) returns (bool) {
    return ERC721.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
  }


  /**
   * ~~~~ WHITELIST CODE ~~~~
   */
  function _whitelistLeaf(address _account) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(_account));
  }

  function _whitelistVerify(address _account, bytes32[] memory _proof) internal view returns (bool) {
    return MerkleProof.verify(_proof, WHITELIST_ROOT, _whitelistLeaf(_account));
  }
  function setWhitelistRoot(bytes32 _root) external {
    require(hasRole(MINTER_ROLE, msg.sender), "Only authorized user can do this");
    WHITELIST_ROOT = _root;
  }

}