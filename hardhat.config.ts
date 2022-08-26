import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks :{
   goerli : {
      url: `${process.env.ALCHEMY_GOERLI_NET}${process.env.ALCHEMY_GOERLI_NET_KEY}`,
      accounts:[process.env.PRIVATE_KEY_ONE!,process.env.PRIVATE_KEY_TWO!]
    }
  },
  solidity: {
    version: "0.8.9",
    settings:{
      optimizer : {
        enabled: true,
        runs:200
      }
    }
  },
};

export default config;
