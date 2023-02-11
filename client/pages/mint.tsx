import { ReactElement } from "react";
import type { NextPage } from "next";
import { useEffect, useState, useCallback } from "react";
import useEthersProvider from "../context/useEthersProvider";
import { useAccount, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";
import Contract721 from "../../artifacts/contracts/BibsERC721.sol/BibsERC721.json";
import FakeUSDT from "../../artifacts/contracts/FakeUSDT.sol/FakeUSDT.json";
import whitelist from "../context/whitelist.json";
import { MerkleTree } from "merkletreejs";
import Counter from "../components/Counter";
import Button from "../components/Button";

const MarketPlace: NextPage = () => {
  const { contractFakeUSDT, contract721Address, owner } = useEthersProvider();
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [sellingStep, setSellingStep] = useState<number | null>(null);
  const [lastPriceETH, setLastPriceETH] = useState<number>(0);
  const [allowanceUSDT, setAllowanceUSDT] = useState<number>(0);
  const [whitelistSalePrice, setWhitelistSalePrice] = useState<number>(0);
  const [publicSalePrice, setPublicSalePrice] = useState<number>(0);
  const [maxSup, setMaxSup] = useState<number | null>(null);
  const [currentTotalSupply, setCurrentTotalSupply] = useState<number | null>(
    null
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [counterNFT, setCounterNFT] = useState<number>(1);
  const [counterStep, setCounterStep] = useState<number>(0);
  const [basketETH, setBasketETH] = useState<number>(0);
  const [counterGift, setCounterGift] = useState<number>(0);
  const [giftAddress, setGiftAddress] = useState<string>("");
  const [newMerkleRoot, setNewMerkleRoot] = useState<string>("");
  const [newBaseUri, setNewBaseUri] = useState<string>("");

  const getAllowance = useCallback(async () => {
    if (provider && signer) {
      const contractUSDT = new ethers.Contract(
        contractFakeUSDT,
        FakeUSDT.abi,
        signer
      );
      try {
        const allowance = await contractUSDT.allowance(
          address,
          contract721Address,
          {
            from: address,
          }
        );
        setAllowanceUSDT(allowance);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
      }
    }
  }, [address, provider, signer, contractFakeUSDT, contract721Address]);

  useEffect(() => {
    const getDatas = async () => {
      setIsLoading(true);
      try {
        const contract = new ethers.Contract(
          contract721Address,
          Contract721.abi,
          provider
        );
        setSellingStep(await contract.sellingStep());
        setLastPriceETH(parseInt(await contract.getLatestPrice()));
        setWhitelistSalePrice(parseInt(await contract.whitelistSalePrice()));
        setPublicSalePrice(parseInt(await contract.publicSalePrice()));
        setMaxSup(await contract.MAX_SUPPLY());
        setCurrentTotalSupply(await contract.nextNFT());
        getAllowance();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    if (provider && address && contract721Address) {
      getDatas();
    }
  }, [address, provider, contract721Address, getAllowance]);

  // EVENTS
  useEffect(() => {
    if (provider && contract721Address != "") {
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        provider
      );
      contract.on("Transfer", async (from, to, id) => {
        if (from === "0x0000000000000000000000000000000000000000") {
          setCurrentTotalSupply(await contract.nextNFT());
        }
      });
    }
  }, [provider, contract721Address]);

  useEffect(() => {
    if (publicSalePrice && whitelistSalePrice && lastPriceETH) {
      if (sellingStep === 1) {
        const result =
          (counterNFT * (whitelistSalePrice * 10 ** 8)) / lastPriceETH;
        setBasketETH(Math.ceil(result * 10 ** 8) / 10 ** 8);
      }
      if (sellingStep === 2) {
        const result =
          (counterNFT * (publicSalePrice * 10 ** 8)) / lastPriceETH;
        setBasketETH(Math.ceil(result * 10 ** 8) / 10 ** 8);
      }
      if (sellingStep === 0) {
        setBasketETH(0);
      }
    }
  }, [
    sellingStep,
    counterNFT,
    publicSalePrice,
    whitelistSalePrice,
    lastPriceETH,
  ]);

  async function approveUSDT(_quantity: number, _price: number) {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contractFakeUSDT,
        FakeUSDT.abi,
        signer
      );

      try {
        const transaction = await contract.approve(
          contract721Address,
          ethers.utils.parseUnits((_quantity * _price).toString(), 6),
          {
            from: address,
          }
        );
        await transaction.wait();
        const allowance = await contract.allowance(
          address,
          contract721Address,
          {
            from: address,
          }
        );
        setAllowanceUSDT(allowance);
        if (_price === publicSalePrice) {
          publicSaleMintUSDT(_quantity);
        } else {
          whitelistSaleMintUSDT(_quantity);
        }
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function setStep(_step: number) {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        const transaction = await contract.setStep(_step, { from: address });
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function setBaseUri(_baseUri: string) {
    if (provider && signer) {
      setIsLoading(true);

      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.setBaseUri(_baseUri, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function whitelistSaleMint(_quantity: number) {
    if (address && provider && signer && basketETH) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      let tab: any[] = [];
      whitelist.map((token: any) => tab.push(token.address));
      const leaves = tab.map((address) => ethers.utils.keccak256(address));
      const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
        sortPairs: true, // Attention sortPairs et non sort (crossmint)
      });
      const leaf = ethers.utils.keccak256(address);
      const proof = tree.getHexProof(leaf);

      try {
        let overrides = {
          from: address,
          value: ethers.utils.parseEther(basketETH.toString()),
        };
        const transaction = await contract.whitelistSaleMint(
          _quantity,
          proof,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function whitelistSaleMintUSDT(_quantity: number) {
    if (address && provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      let tab: any[] = [];
      whitelist.map((token: any) => tab.push(token.address));
      const leaves = tab.map((address) => ethers.utils.keccak256(address));
      const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
        sortPairs: true, // Attention sortPairs et non sort (crossmint)
      });
      const leaf = ethers.utils.keccak256(address);
      const proof = tree.getHexProof(leaf);

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.whitelistSaleMintUSDT(
          _quantity,
          proof,
          overrides
        );
        await transaction.wait();
        getAllowance();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function publicSaleMint(_quantity: number) {
    if (provider && signer && basketETH) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      console.log("basketETH.toString() :>> ", basketETH.toString());

      try {
        let overrides = {
          from: address,
          value: ethers.utils.parseEther(basketETH.toString()),
        };
        const transaction = await contract.publicSaleMint(_quantity, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function publicSaleMintUSDT(_quantity: number) {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );
      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.publicSaleMintUSDT(
          _quantity,
          overrides
        );
        await transaction.wait();
        getAllowance();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function gift(_to: string, _quantity: number) {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.gift(_to, _quantity, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  async function setMerkleRoot(_merkleRoot: string) {
    if (provider && signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: address,
        };
        const transaction = await contract.setMerkleRoot(
          _merkleRoot,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(String(error));
        }
        setIsLoading(false);
      }
    }
  }

  const handleMintUSDT = (_type: boolean, _quantity: number) => {
    if (_type) {
      if (allowanceUSDT >= _quantity * publicSalePrice * 10 ** 6) {
        publicSaleMintUSDT(_quantity);
      } else {
        approveUSDT(_quantity, publicSalePrice);
      }
    } else {
      if (allowanceUSDT >= _quantity * whitelistSalePrice * 10 ** 6) {
        whitelistSaleMintUSDT(_quantity);
      } else {
        approveUSDT(_quantity, whitelistSalePrice);
      }
    }
  };

  return (
    <div className="mb-auto min-h-screen">
      <div className="text-center">
        {!isConnected ? (
          <p className="text-2xl text-red-500 my-12">Connecte toi pour mint</p>
        ) : (
          <>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="text-center">
                <p className="text-2xl my-12">MarketPlace</p>

                {currentTotalSupply && maxSup && (
                  <p className="text-xl text-green-700 my-12">
                    NFTs minted : {currentTotalSupply.toString()}/{maxSup}
                  </p>
                )}

                {sellingStep === 1 || sellingStep === 2 ? (
                  <div className="flex flex-col items-center justify-center mb-12">
                    <p className="text-xl mb-2">How many NFTs do you want ?</p>

                    <Counter
                      counter={counterNFT}
                      setCounter={setCounterNFT}
                      start={1}
                      limit={sellingStep === 1 ? 3 : 100}
                    />

                    {sellingStep === 1 ? (
                      <div className="flex items-center justify-center my-12">
                        <p className="text-base mr-8">
                          Price : {counterNFT * whitelistSalePrice} USDT or{" "}
                          {basketETH} ETH
                        </p>
                        <Button
                          onClick={() => whitelistSaleMint(counterNFT)}
                          label={
                            isLoading ? "Loading..." : "WHITELIST MINT ETH"
                          }
                          disabled={isLoading ? true : false}
                        />
                        <div className="mr-4" />
                        <Button
                          onClick={() => handleMintUSDT(false, counterNFT)}
                          label={
                            isLoading ? "Loading..." : "WHITELIST MINT USDT"
                          }
                          disabled={isLoading ? true : false}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center my-12">
                        <p className="text-base mr-8">
                          Price : {counterNFT * publicSalePrice} USDT or{" "}
                          {basketETH} ETH
                        </p>
                        <Button
                          onClick={() => publicSaleMint(counterNFT)}
                          label={isLoading ? "Loading..." : "PUBLIC MINT ETH"}
                          disabled={isLoading ? true : false}
                        />
                        <div className="mr-4" />
                        <Button
                          onClick={() => handleMintUSDT(true, counterNFT)}
                          label={isLoading ? "Loading..." : "PUBLIC MINT USDT"}
                          disabled={isLoading ? true : false}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xl my-12">
                    La vente n&apos;a pas encore débuté
                  </p>
                )}

                {address && owner === address && (
                  <>
                    <p className="text-2xl text-red-500 my-12">ADMIN</p>
                    <div className="flex items-center justify-center mb-12">
                      <p className="text-2xl text-green-500">
                        Actuel : {sellingStep}
                      </p>

                      <Counter
                        counter={counterStep}
                        setCounter={setCounterStep}
                        start={0}
                        limit={2}
                      />

                      <Button
                        onClick={() => setStep(counterStep)}
                        label={isLoading ? "Loading..." : "SETSTEP"}
                        disabled={isLoading ? true : false}
                      />
                    </div>

                    <div className="flex items-center justify-center mb-12">
                      <input
                        placeholder="Address"
                        onChange={(e) => setGiftAddress(e.target.value)}
                        className="relative block overflow-hidden rounded-lg border border-gray-200 px-3 py-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                      />

                      <Counter
                        counter={counterGift}
                        setCounter={setCounterGift}
                        start={1}
                        limit={100}
                      />

                      <Button
                        onClick={() => gift(giftAddress, counterGift)}
                        label={isLoading ? "Loading..." : "GIFT"}
                        disabled={isLoading ? true : false}
                      />
                    </div>

                    <div className="flex items-center justify-center mb-12">
                      <input
                        placeholder="Merkle Root"
                        onChange={(e) => setNewMerkleRoot(e.target.value)}
                        className="relative block overflow-hidden rounded-lg border border-gray-200 px-3 py-3 mr-8 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                      />

                      <Button
                        onClick={() => setMerkleRoot(newMerkleRoot)}
                        label={isLoading ? "Loading..." : "SET MERKLEROOT"}
                        disabled={isLoading ? true : false}
                      />
                    </div>

                    <div className="flex items-center justify-center mb-12">
                      <input
                        placeholder="Base URI"
                        onChange={(e) => setNewBaseUri(e.target.value)}
                        className="relative block overflow-hidden rounded-lg border border-gray-200 px-3 py-3 mr-8 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                      />

                      <Button
                        onClick={() => setBaseUri(newBaseUri)}
                        label={isLoading ? "Loading..." : "SET BASE URI"}
                        disabled={isLoading ? true : false}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketPlace;
