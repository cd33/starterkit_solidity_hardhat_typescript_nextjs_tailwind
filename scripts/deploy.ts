import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";
import { MerkleTree } from 'merkletreejs'
import whitelist from './whitelist.json';

async function main() {
  const FakeUSDT = await ethers.getContractFactory("FakeUSDT")
  const fakeUSDT = await FakeUSDT.deploy()
  await fakeUSDT.deployed()
  console.log("Deployed FakeUSDT at address", fakeUSDT.address)

  const baseUri = "ipfs://XXX/";
  let tab: any[] = [];
  whitelist.map((token: any) => {
    tab.push(token.address);
  });
  const leaves = tab.map((address) => ethers.utils.keccak256(address));
  const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
    sortPairs: true,
  }); // Attention sortPairs et non sort (crossmint)
  const root = tree.getHexRoot();

  const BibsERC721 = await ethers.getContractFactory("BibsERC721");
  const bibsERC721 = await BibsERC721.deploy(root, baseUri, fakeUSDT.address);
  await bibsERC721.deployed();
  console.log("Deployed BibsERC721 at address", bibsERC721.address);

  if (network.name === "goerli") {
    console.log("Verifying FakeUSDT...")
    await fakeUSDT.deployTransaction.wait(6) // Attendre 6 block après le déploiment
    await verify(fakeUSDT.address, [])

    console.log("Verifying BibsERC721...");
    await bibsERC721.deployTransaction.wait(6); // Attendre 6 block après le déploiment
    await verify(bibsERC721.address, [root, baseUri, fakeUSDT.address]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
