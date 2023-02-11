# starterkit_solidity_hardhat_typescript_nextjs_tailwind
## Description
Simple Starterkit for mint ERC721 app, using hardhat, typescript, ethers, next, tailwind...

## Commands Used
### Init
```shell
yarn init
yarn add hardhat
yarn hardhat
yarn add "hardhat" "@nomicfoundation/hardhat-toolbox" "@nomicfoundation/hardhat-network-helpers" "@nomicfoundation/hardhat-chai-matchers" "@nomiclabs/hardhat-ethers" "@nomiclabs/hardhat-etherscan" "chai" "ethers" "hardhat-gas-reporter" "solidity-coverage" "@typechain/hardhat" "typechain" "@typechain/ethers-v5" "@ethersproject/abi" "@ethersproject/providers" "@types/chai" "@types/mocha" "@types/node" "ts-node" "typescript" "dotenv" "@openzeppelin/contracts" "prettier-plugin-solidity" "merkletreejs"
```

### Hardhat
```
yarn hardhat node
yarn hardhat run .\scripts\deploy.ts --network localhost
yarn hardhat typechain
yarn hardhat test
yarn hardhat coverage
```

### Front
```
yarn create client --typescript
yarn add react-toastify react-loader-spinner @rainbow-me/rainbowkit wagmi ethers
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
