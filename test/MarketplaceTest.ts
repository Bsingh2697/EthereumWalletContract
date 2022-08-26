import {ethers} from 'hardhat';
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require('chai')
const testTokenUri = 'QmPLvqxCHqpBdaujurBYVPhqoSV9ytFYXsCeyTN6hBTw78'

describe('NFT Creation', function(){

    async function deployMarketplaceFixture() {
        const[owner, addr1, addr2] = await ethers.getSigners();
        const MPlace = await ethers.getContractFactory('ETHWalletMarketplace');
        const contract = await MPlace.deploy();
        let listingPrice = await contract.getListPrice();

        return {owner, addr1, addr2, contract,listingPrice};
    }

    it("NFT Creation should transfer token ownership to the contract owner", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);

        // console.log("Owner",addr1.address);
        // console.log("Owner Balance",ethers.utils.formatEther(await owner.getBalance()).toString());
        // console.log("Addr 1",addr1.address);
        // console.log("Addr 1 Balance", ethers.utils.formatEther(await owner.getBalance()));
        // console.log("Addr 2",addr2.address);
        // console.log("Addr 2 Balance",ethers.utils.formatEther(await owner.getBalance()));

        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        const latestId = await contract.getLatesIdToListedToken();
        expect(latestId.owner).to.equal(contract.address)

    });

    it("Get all NFTs on the marketplaces", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        let tokens = await contract.getAllNFTs()
        let tokenId = await contract.getCurrentToken()
        // console.log("Total NFTs :",tokens.length);
        // console.log("Last Token Id :",tokenId);

        expect(tokens.length).to.equal(tokenId);
    })

    it("Execute Transaction", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        
        const latestId = await contract.getLatesIdToListedToken();
        // console.log("Address Buyer -- addr2:",addr2.address);
        // console.log("Latest Token Id :",latestId.tokenId);
        // console.log("Owner :",latestId.owner);
        // console.log("Seller :",latestId.seller);
        await contract.connect(addr2).executeSale(latestId.tokenId,{value: latestId.price})
   
        const newId = await contract.getLatesIdToListedToken();
        // console.log("Owner 1:",newId.owner);
        // console.log("Seller 1:",newId.seller);
        expect(addr2.address).to.equal(newId.seller)
    })

})