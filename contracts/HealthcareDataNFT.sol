pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol";

contract HealthcareDataNFT is ERC721BasicToken {
    struct Metadata {
        string dataType;
        string date;
        string provider;
        string ipfsHash;
    }

    string public name;
    string public symbol;

    uint256 private _totalSupply;

    mapping(uint256 => Metadata) public metadataStore;
    mapping(uint256 => mapping(address => string)) public accessKeys; // Encrypted keys for access control
    mapping(address => uint256[]) public grantedTokens; // Tracks Token IDs a user has access to

    event AccessGranted(uint256 indexed tokenId, address indexed user, uint256 timestamp, string encryptedKey);
    event AccessRevoked(uint256 indexed tokenId, address indexed user, uint256 timestamp);

    constructor() public {
        name = "HealthcareDataNFT";
        symbol = "HDNFT";
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenOwner[tokenId] != address(0); // Check if a token ID has an owner
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function mintNFT(
        uint256 tokenId,
        string dataType,
        string date,
        string provider,
        string ipfsHash
    ) public {
        require(!_exists(tokenId), "Token ID already exists");
        _mint(msg.sender, tokenId);

        metadataStore[tokenId] = Metadata({
            dataType: dataType,
            date: date,
            provider: provider,
            ipfsHash: ipfsHash
        });

        _totalSupply = _totalSupply + 1;
    }

    function grantAccess(uint256 tokenId, address user, string encryptedKey) public {
    require(_exists(tokenId), "Token ID does not exist");
    require(ownerOf(tokenId) == msg.sender, "Only owner can grant access");
    require(user != address(0), "Invalid user address");
    require(bytes(encryptedKey).length > 0, "Encrypted key cannot be empty");

    accessKeys[tokenId][user] = encryptedKey; // Store encrypted key specific to the user
    emit AccessGranted(tokenId, user, now, encryptedKey);
}


    function revokeAccess(uint256 tokenId, address user) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can revoke access");

        delete accessKeys[tokenId][user]; // Remove encrypted key

        // Remove tokenId from user's granted tokens
        uint256[] storage tokens = grantedTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.length--;
                break;
            }
        }

        emit AccessRevoked(tokenId, user, now);
    }

    function getGrantedTokens(address user) public view returns (uint256[]) {
        return grantedTokens[user];
    }

    function getEncryptedKey(uint256 tokenId, address user) public view returns (string) {
    require(_exists(tokenId), "Token ID does not exist");
    require(bytes(accessKeys[tokenId][user]).length != 0, "No access granted for this user");
    return accessKeys[tokenId][user];
}


    function getMetadata(uint256 tokenId) public view returns (string, string, string, string) {
        Metadata memory data = metadataStore[tokenId];
        return (data.dataType, data.date, data.provider, data.ipfsHash);
    }
}
