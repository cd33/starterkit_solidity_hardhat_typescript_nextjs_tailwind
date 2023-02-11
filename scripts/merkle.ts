import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import whitelist from "./whitelist.json";

async function main() {
  let tab: string[] = [];
  whitelist.map((token) => {
    tab.push(token.address);
  });
  const leaves = tab.map((address) => ethers.utils.keccak256(address));
  const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
    sortPairs: true,
  }); // Attention sortPairs et non sort (crossmint)
  const root = tree.getHexRoot();

  const leaf = ethers.utils.keccak256("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  const proof = tree.getHexProof(leaf);

  console.log("root: ", root);
  console.log("proof: ", proof);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });