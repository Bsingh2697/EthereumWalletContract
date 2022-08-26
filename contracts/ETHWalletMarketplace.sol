// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol"; // Simlar to console.log
import "@openzeppelin/contracts/utils/Counters.sol"; // Counter implementation in solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // Set of functions to store token uri
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // Implementation on ERC721 standard

contract ETHWalletMarketplace is ERC721URIStorage {
    address payable owner; // Owner of the contract
    using Counters for Counters.Counter; //Counter
    Counters.Counter private _tokenIds; //Count current token ID- Currently minted NFT
    Counters.Counter private _itemsSold; //Count total items sold

    uint256 listPrice = 0.01 ether; //Price paid for listing NFTs

    //Stores the listed Token of the NFT
    struct ListedToken {
        uint256 tokenId; // Token Id of the NFT
        address payable owner; // First Owner of the NFT
        address payable seller; // Current Owner/Seller of the NFT
        uint256 price; // Price of the NFT
        bool currentlyListed; // Listing Status of the NFT(Listed/Unlisted)
    }

    mapping(uint256 => ListedToken) private idToListedToken;

    /**
     * argumentOne Name of the class
     * argumentTwo Acronym for the contract class
     */
    constructor() ERC721("ETHWalletMarketplace", "ETHWM") {
        owner = payable(msg.sender);
    }

    // ******************************** Helper functions ********************************

    /**
        @param _listPrice contract owner can change the listing price - Charges for listing NFTs
     */
    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update the listing price");
        listPrice = _listPrice;
    }

    /**
    @return listPrice as the current listing price for NFTs
     */
    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    /**
    @return idToListedToken[tokenId] => Data of the latest uploaded NFT
     */
    function getLatesIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    /**
    @return idToListedToken[tokenId] =>  Data of the requested NFT
     */
    function getListedForTokenId(uint256 tokenId)
        public
        view
        returns (ListedToken memory)
    {
        return idToListedToken[tokenId];
    }

    /**
    @return _tokenIds.current() => Latest token id
     */
    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    // ******************************** Main functions ********************************

    /**
    @param tokenURI token uri sent from frontend after uploading data to IPFS
    @param price price at which the NFT will be sold
    @return currentTokenId This is the id of the newly created NFT token
     */
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(
            msg.value == listPrice,
            "Insufficient funds for creating token"
        );
        require(price > 0, "Price must be greater than 0");

        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        _safeMint(msg.sender, currentTokenId); // Mints the token to the address // If address is invalid it returns instead to creating a new address

        _setTokenURI(currentTokenId, tokenURI);

        createListedToken(currentTokenId, price);

        return currentTokenId;
    }

    /**
     @param tokenId  Id of the lated token created
     @param price   Price of the lated token created
     */
    function createListedToken(uint256 tokenId, uint256 price) private {
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true // Default to true, we can later add functionality to mint NFT on demand
        );

        // Transfers token to the contract owner,
        // Otherwise we would need to implement approve() functionality to transfer token
        _transfer(msg.sender, address(this), tokenId);
    }

    /**
    @return tokens All NFTs in the marketplace
     */
    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint256 currentIndex = 0;
        uint256 currentId = 0;
        for (uint256 i = 0; i < nftCount; i++) {
            currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }

    /**
    @return items List of all NFTs owned by the address
     */
    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // Total NFTs count
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                itemCount += 1;
            }
        }
        // Fetching NFTs
        ListedToken[] memory items = new ListedToken[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                uint256 currentId = i + 1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
    @param tokenId Id of the NFT token to be sold
     */
    function executeSale(uint256 tokenId) public payable {
        uint256 price = idToListedToken[tokenId].price;
        require(
            msg.value == price,
            "Insuffient ether sent for the NFT purchase"
        );
        address seller = idToListedToken[tokenId].seller;

        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        approve(address(this), tokenId);

        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
    }
}
