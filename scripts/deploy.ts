import {ethers} from 'hardhat'

async function main(){
    const [deployer] = await ethers.getSigners();

    console.log("Account Address:",deployer.address);
    console.log("Account Balance :",(await deployer.getBalance()).toString());

    const Token = await ethers.getContractFactory('ETHWalletMarketplace');
    const token = await Token.deploy();

    console.log("Contract Address :", token.address);
}
main().then(() => {
    process.exit(0);
}).catch((err) => {
    console.log("Error : ",err);
    process.exit(1);
})