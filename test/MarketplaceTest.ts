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
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        const latestId = await contract.getLatesIdToListedToken();
        expect(latestId.owner).to.equal(contract.address)
    });

    it("Get all NFTs on the marketplaces", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        let tokens = await contract.getAllNFTs()
        let tokenId = await contract.getCurrentToken()
        expect(tokens.length).to.equal(tokenId);
    })

    it("Get a users' NFTs on the marketplaces", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        await contract.createToken(testTokenUri,1,{value: listingPrice})
        await contract.createToken(testTokenUri,1,{value: listingPrice})

        let tokens = await contract.getMyNFTs()

        expect(tokens.length).to.equal(2);
    })

    it("Execute Transaction", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        const latestId = await contract.getLatesIdToListedToken();
        await contract.connect(addr2).executeSale(latestId.tokenId,{value: latestId.price})
        const newId = await contract.getLatesIdToListedToken();
        expect(addr2.address).to.equal(newId.seller)
    })

    it("Check the id of latest token", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        await contract.connect(addr1).createToken(testTokenUri,1,{value: listingPrice})
        const latestId = await contract.getLatesIdToListedToken();
        expect(latestId.tokenId).to.equal(2)
    })

    it("Execute Transaction with price more than Account funds ", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        try{await expect(contract.createToken(testTokenUri,1,{value: ethers.utils.parseUnits((100000).toString(),'ether')}))
        .to.be.revertedWith('Insufficient funds for creating token')}
        catch(err:any) {
            console.log("Error(Execute Transaction with price more than Account funds) Test Case:",err.message);
        }
    })
    
    it("Execute Transaction with low listing fee ", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await expect(contract.createToken(testTokenUri,1,{value: ethers.utils.parseUnits((10000).toString(),'wei')}))
        .to.be.revertedWith('Insufficient funds for creating token')
    })

    it("Fetch NFT data ", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        await expect(contract.getListedForTokenId(1))
    })

      it("Fetching Invalid Token data ", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        let tData = await contract.getListedForTokenId(10)
        expect(tData.owner).to.not.equal(owner)
    })

    it("Execute Transaction negative price", async function(){
        const {owner, addr1, addr2, contract,listingPrice} = await loadFixture(deployMarketplaceFixture);
        try{await expect(contract.createToken(testTokenUri,-ethers.utils.parseUnits((1).toString(),'wei'),{value: listingPrice}))
        .to.be.revertedWith('Price must be greater than 0')}
        catch(err:any){
            console.log("Error(Execute Transaction negative price) Test Case:",err.message);
        }
    })
})