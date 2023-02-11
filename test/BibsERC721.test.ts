import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeUSDT, BibsERC721 } from "../typechain-types/contracts";

// only() allows to execute only this test
//describe.only("BibsERC721", function () {
describe("BibsERC721", function () {
  let usdt: FakeUSDT;
  let token: BibsERC721;

  const merkleRoot =
    "0x98a5bebb456112fc8912f8047da649ee65a0ab67c7a2f18930a1df407ad89177";
  const proofOwner = [
    "0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94",
    "0x28ee50ccca7572e60f382e915d3cc323c3cb713b263673ba830ab179d0e5d57f",
  ];
  const proofUser = [
    "0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9",
    "0x28ee50ccca7572e60f382e915d3cc323c3cb713b263673ba830ab179d0e5d57f",
  ];
  const baseURI = "ipfs://XXX/";
  const MAX_SUPPLY = 5000;
  const publicSalePrice = 150;
  const whitelistSalePrice = 50;
  const whitelistLimitBalance = 3;

  function chainlinkPrice(price: number) {
    const amount: number = (price * 10 ** 8) / 162150000000;
    const calcul: number = amount + amount / 10 ** 13;
    return ethers.utils.parseUnits(calcul.toFixed(18).toString());
  }

  function usdtPrice(price: number) {
    return ethers.utils.parseUnits(price.toString(), 6);
  }

  beforeEach(async function () {
    [this.owner, this.investor, this.user] = await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 et 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc
    const FakeUSDT = await ethers.getContractFactory("FakeUSDT");
    usdt = await FakeUSDT.deploy();
    const BibsERC721 = await ethers.getContractFactory("BibsERC721");
    token = await BibsERC721.deploy(merkleRoot, baseURI, usdt.address);
    await token.deployed();
  });

  describe("WHITELIST", function () {
    it("WhitelistMint whitelistSaleMint() tests argents", async function () {
      await token.setStep(1);
      let balanceUserNFT = await token.balanceOf(this.user.address);
      expect(balanceUserNFT).to.equal(0);
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );
      const balanceUserETHBefore = await ethers.provider.getBalance(
        this.user.address
      );

      await token.connect(this.user).whitelistSaleMint(1, proofUser, {
        value: chainlinkPrice(whitelistSalePrice),
      });

      balanceUserNFT = await token.balanceOf(this.user.address);
      expect(balanceUserNFT).to.equal(1);
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      const balanceUserETHAfter = await ethers.provider.getBalance(
        this.user.address
      );
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
      expect(balanceUserETHBefore).to.be.gt(balanceUserETHAfter);
    });

    it("REVERT: whitelistSaleMint() Not active", async function () {
      await expect(
        token.whitelistSaleMint(1, proofOwner, { value: whitelistSalePrice })
      ).to.be.revertedWith("Whitelist sale not active");
    });

    it("REVERT: whitelistSaleMint() Quantity must be greater than 0", async function () {
      await token.setStep(1);
      await expect(token.whitelistSaleMint(0, proofOwner)).to.be.revertedWith(
        "Quantity must be greater than 0"
      );
    });

    it("REVERT: whitelistSaleMint() merkle access Not whitelisted", async function () {
      await token.setStep(1);
      await expect(
        token
          .connect(this.investor)
          .whitelistSaleMint(1, proofOwner, { value: whitelistSalePrice })
      ).to.be.revertedWith("Not whitelisted");
    });

    it("REVERT: whitelistSaleMint() Limited number per wallet", async function () {
      await token.setStep(1);
      await token.whitelistSaleMint(3, proofOwner, {
        value: chainlinkPrice(3 * whitelistSalePrice),
      });

      await expect(
        token.whitelistSaleMint(1, proofOwner, {
          value: chainlinkPrice(whitelistSalePrice),
        })
      ).to.be.revertedWith("Limited number per wallet");
    });

    it("REVERT: whitelistSaleMint() Not enough money", async function () {
      await token.setStep(1);
      await expect(
        token.whitelistSaleMint(1, proofOwner, {
          value: ethers.utils.parseEther("0.0000005"),
        })
      ).to.be.revertedWith("Not enough funds");
    });

    it("REVERT: setMerkleRoot() Not Owner", async function () {
      await expect(
        token
          .connect(this.investor)
          .setMerkleRoot(
            "0x83cf4855b2c3c8c4e206fcba016cc84f201cd5b8b480fb6878405db4065e94ea"
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("WHITELIST USDT", function () {
    it("whitelistSaleMintUSDT() acceptPayment", async function () {
      expect(await token.balanceOf(this.user.address)).to.equal(0);
  
      expect(await usdt.balanceOf(this.investor.address)).to.equal(0);
      expect(await usdt.balanceOf(this.user.address)).to.equal(0);
      await usdt.mint(this.user.address, usdtPrice(3*whitelistSalePrice));
      expect(await usdt.balanceOf(this.user.address)).to.equal(
        usdtPrice(3*whitelistSalePrice)
      );
  
      expect(await usdt.allowance(this.user.address, token.address)).to.equal(
        0
      );
      await usdt
        .connect(this.user)
        .approve(token.address, usdtPrice(3*whitelistSalePrice));
      expect(await usdt.allowance(this.user.address, token.address)).to.equal(
        usdtPrice(3*whitelistSalePrice)
      );
  
      await token.setStep(1);
      await token.connect(this.user).whitelistSaleMintUSDT(3, proofUser);
  
      expect(await usdt.balanceOf(this.investor.address)).to.equal(
        usdtPrice(3*whitelistSalePrice)
      );
      expect(await usdt.balanceOf(this.user.address)).to.equal(0);
      expect(await token.balanceOf(this.user.address)).to.equal(3);
    });
  
    it("REVERT: whitelistSaleMintUSDT() Not active", async function () {
      await expect(token.whitelistSaleMintUSDT(1, proofOwner)).to.be.revertedWith(
        "Whitelist sale not active"
      );
    });
  
    it("REVERT: whitelistSaleMintUSDT(), Si le sender n'a pas approve, ERC20: insufficient allowance", async function () {
      await usdt.mint(this.user.address, usdtPrice(whitelistSalePrice));
  
      const allowanceUSDTInvestor = await usdt.allowance(
        this.user.address,
        token.address
      );
      expect(allowanceUSDTInvestor).to.equal(0);
  
      await token.setStep(1);
      await expect(
        token.connect(this.user).whitelistSaleMintUSDT(1, proofUser)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  
    it("REVERT: whitelistSaleMintUSDT(), Si le sender est approve mais n'a pas les fonds, ERC20: transfer amount exceeds balance", async function () {
      await usdt
        .connect(this.user)
        .approve(token.address, usdtPrice(whitelistSalePrice));
  
      const allowanceUSDTInvestor = await usdt.allowance(
        this.user.address,
        token.address
      );
      expect(allowanceUSDTInvestor).to.equal(usdtPrice(whitelistSalePrice));
  
      await token.setStep(1);
      await expect(
        token.connect(this.user).whitelistSaleMintUSDT(1, proofUser)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  
    it("REVERT: whitelistSaleMintUSDT(), Si le sender n'a pas les fonds et n'est pas approve, ERC20: insufficient allowance", async function () {
      await token.setStep(1);
      await expect(
        token.connect(this.user).whitelistSaleMintUSDT(1, proofUser)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("PUBLIC SALE", function () {
    it("PublicSaleMint publicSaleMint() tests argents", async function () {
      await token.setStep(2);
      let balanceUserNFT = await token.balanceOf(this.user.address);
      expect(balanceUserNFT).to.equal(0);
      const balanceUserETHBefore = await ethers.provider.getBalance(
        this.user.address
      );
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );
  
      const mint = await token
        .connect(this.user)
        .publicSaleMint(1, { value: chainlinkPrice(publicSalePrice) });
      await mint.wait();
  
      balanceUserNFT = await token.balanceOf(this.user.address);
      expect(balanceUserNFT).to.equal(1);
      const balanceUserETHAfter = await ethers.provider.getBalance(
        this.user.address
      );
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      expect(balanceUserETHBefore).to.be.gt(balanceUserETHAfter);
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
    });

    it("REVERT: publicSaleMint() Not active", async function () {
      await expect(
        token.publicSaleMint(1, { value: publicSalePrice.toString() })
      ).to.be.revertedWith("Public sale not active");
    });

    it("REVERT: publicSaleMint() Quantity must be greater than 0", async function () {
      await token.setStep(2);
      await expect(token.publicSaleMint(0)).to.be.revertedWith(
        "Quantity must be greater than 0"
      );
    });

    // it("REVERT: publicSaleMint() & gift() Sold out et tests de balances", async function () {
    //   await token.setStep(2);
    //   let currentIdNFT = await token.nextNFT();
    //   expect(currentIdNFT).to.equal(0);
    //   let balanceOwnerNFT = await token.balanceOf(this.owner.address);
    //   expect(balanceOwnerNFT).to.equal(0);

    //   for (let i = 0; i < 50; i++) {
    //     await token.publicSaleMint(100, {
    //       value: chainlinkPrice(100 * publicSalePrice),
    //     });
    //   }
    //   currentIdNFT = await token.nextNFT();
    //   expect(currentIdNFT).to.equal(5000);
    //   balanceOwnerNFT = await token.balanceOf(this.owner.address);
    //   expect(balanceOwnerNFT).to.equal(5000);

    //   await expect(
    //     token
    //       .connect(this.user)
    //       .publicSaleMint(1, { value: chainlinkPrice(publicSalePrice) })
    //   ).to.be.revertedWith("Sold out");

    //   await expect(token.gift(this.investor.address, 3)).to.be.revertedWith(
    //     "Sold out"
    //   );
    // });

    it("REVERT: publicSaleMint() Not enough money", async function () {
      await token.setStep(2);
      await expect(
        token.publicSaleMint(3, {
          value: ethers.utils.parseEther("0.00000005"),
        })
      ).to.be.revertedWith("Not enough funds");
    });
  });

  describe("PUBLIC SALE USDT", function () {
    it("publicSaleMintUSDT() acceptPayment", async function () {
      expect(await token.balanceOf(this.owner.address)).to.equal(0);
  
      expect(await usdt.balanceOf(this.owner.address)).to.equal(
        ethers.utils.parseUnits((1e6).toString(), 6)
      );
      expect(await usdt.balanceOf(this.investor.address)).to.equal(0);
      // await usdt.mint(this.investor.address, usdtPrice(publicSalePrice));
      // expect(await usdt.balanceOf(this.investor.address)).to.equal(
      //   usdtPrice(publicSalePrice)
      // );
  
      expect(await usdt.allowance(this.owner.address, token.address)).to.equal(
        0
      );
      await usdt.approve(token.address, usdtPrice(10*publicSalePrice));
      expect(await usdt.allowance(this.owner.address, token.address)).to.equal(
        usdtPrice(10*publicSalePrice)
      );
  
      await token.setStep(2);
      await token.publicSaleMintUSDT(10);
  
      expect(await usdt.balanceOf(this.investor.address)).to.equal(
        usdtPrice(10*publicSalePrice)
      );
      expect(await usdt.balanceOf(this.owner.address)).to.equal(
        usdtPrice(1e6 - 10*publicSalePrice)
      );
      expect(await token.balanceOf(this.owner.address)).to.equal(10);
    });
  
    it("REVERT: publicSaleMintUSDT() Not active", async function () {
      await expect(token.publicSaleMintUSDT(1)).to.be.revertedWith(
        "Public sale not active"
      );
    });
  
    it("REVERT: publicSaleMintUSDT(), Si le sender n'a pas approve, ERC20: insufficient allowance", async function () {
      await usdt.mint(this.investor.address, usdtPrice(publicSalePrice));
  
      const allowanceUSDTInvestor = await usdt.allowance(
        this.investor.address,
        token.address
      );
      expect(allowanceUSDTInvestor).to.equal(0);
  
      await token.setStep(2);
      await expect(
        token.connect(this.investor).publicSaleMintUSDT(1)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  
    it("REVERT: publicSaleMintUSDT(), Si le sender est approve mais n'a pas les fonds, ERC20: transfer amount exceeds balance", async function () {
      await usdt
        .connect(this.investor)
        .approve(token.address, usdtPrice(publicSalePrice));
  
      const allowanceUSDTInvestor = await usdt.allowance(
        this.investor.address,
        token.address
      );
      expect(allowanceUSDTInvestor).to.equal(usdtPrice(publicSalePrice));
  
      await token.setStep(2);
      await expect(
        token.connect(this.investor).publicSaleMintUSDT(1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  
    it("REVERT: publicSaleMintUSDT(), Si le sender n'a pas les fonds et n'est pas approve, ERC20: insufficient allowance", async function () {
      await token.setStep(2);
      await expect(
        token.connect(this.investor).publicSaleMintUSDT(1)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("GIFT", function () {
    it("Gift gift()", async function () {
      let balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(0);

      const mint = await token.gift(this.owner.address, 3);
      await mint.wait();

      balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(3);
    });

    it("REVERT: gift() Zero address", async function () {
      await expect(
        token.gift("0x0000000000000000000000000000000000000000", 3)
      ).to.be.revertedWith("Zero address");
    });

    it("REVERT: gift() Quantity must be greater than 0", async function () {
      await expect(token.gift(this.owner.address, 0)).to.be.revertedWith(
        "Quantity must be greater than 0"
      );
    });

    it("REVERT: gift() Not Owner", async function () {
      await expect(
        token.connect(this.investor).gift(this.investor.address, 10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Royalties", function () {
    it("RoyaltyInfo() and setDefaultRoyalty()", async function () {
      let royalties = await token.royaltyInfo(0, ethers.utils.parseEther("1"));
      expect(royalties[0]).to.equal(token.address);
      expect(ethers.utils.formatEther(royalties[1])).to.equal("0.07");

      await token.setDefaultRoyalty(this.owner.address, 500);

      royalties = await token.royaltyInfo(0, ethers.utils.parseEther("1"));
      expect(royalties[0]).to.equal(this.owner.address);
      expect(ethers.utils.formatEther(royalties[1])).to.equal("0.05");
    });

    it("supportsInterface() ERC165 interface ID", async function () {
      expect(await token.supportsInterface("0xffffffff")).to.equal(false);
      expect(await token.supportsInterface("0x80ac58cd")).to.equal(true); // ERC721
      expect(await token.supportsInterface("0x01ffc9a7")).to.equal(true); // ERC165
      expect(await token.supportsInterface("0x5b5e139f")).to.equal(true); // ERC721Metadata
    });
  });

  describe("Setters, URI, receive", function () {
    it("SetStep setStep() Changements de steps sellingStep()", async function () {
      let step = await token.sellingStep();
      expect(step).to.equal(0);
      await token.setStep(1);
      step = await token.sellingStep();
      expect(step).to.equal(1);
      await token.setStep(2);
      step = await token.sellingStep();
      expect(step).to.equal(2);
      await token.setStep(0);
      step = await token.sellingStep();
      expect(step).to.equal(0);
    });

    it("REVERT: setStep() Not Owner", async function () {
      await expect(token.connect(this.investor).setStep(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("setBaseUri setBaseUri() Changements d'uri", async function () {
      let uri = await token.baseURI();
      expect(uri).to.equal(baseURI);
      await token.setBaseUri("toto");
      uri = await token.baseURI();
      expect(uri).to.equal("toto");
    });

    it("REVERT: setBaseUri() Not Owner", async function () {
      await expect(
        token.connect(this.investor).setBaseUri("toto")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("REVERT: tokenURI() NFT doesn't exist", async function () {
      await expect(token.connect(this.investor).tokenURI(0)).to.be.revertedWith(
        "NFT doesn't exist"
      );
      await expect(token.connect(this.investor).tokenURI(1)).to.be.revertedWith(
        "NFT doesn't exist"
      );
      await token.setStep(2);
      await token.connect(this.investor).publicSaleMint(2, {
        value: chainlinkPrice(2 * publicSalePrice),
      });
      expect(await token.connect(this.investor).tokenURI(1)).to.equal(
        baseURI + "1.json"
      );
      expect(await token.connect(this.investor).tokenURI(2)).to.equal(
        baseURI + "2.json"
      );

      await token.setBaseUri("");
      expect(await token.connect(this.investor).tokenURI(1)).to.equal("");
    });

    it("setPublicSalePrice() Changements d'ID publicSalePrice()", async function () {
      let step = await token.publicSalePrice();
      expect(step).to.equal(publicSalePrice);
      await token.setPublicSalePrice(200);
      step = await token.publicSalePrice();
      expect(step).to.equal(200);
      await token.setPublicSalePrice(1000);
      step = await token.publicSalePrice();
      expect(step).to.equal(1000);
    });

    it("REVERT: setPublicSalePrice() Not Owner", async function () {
      await expect(
        token.connect(this.investor).setPublicSalePrice(2)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setWhitelistSalePrice() Changements d'ID publicSalePrice()", async function () {
      let step = await token.whitelistSalePrice();
      expect(step).to.equal(whitelistSalePrice);
      await token.setWhitelistSalePrice(5);
      step = await token.whitelistSalePrice();
      expect(step).to.equal(5);
      await token.setWhitelistSalePrice(20000);
      step = await token.whitelistSalePrice();
      expect(step).to.equal(20000);
    });

    it("REVERT: setWhitelistSalePrice() Not Owner", async function () {
      await expect(
        token.connect(this.investor).setWhitelistSalePrice(2)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Not allowing receiving ETH outside minting functions, Only if you mint", async function () {
      const balanceOwnerETHBefore = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceContractETHBefore = await ethers.provider.getBalance(
        token.address
      );

      await expect(
        this.owner.sendTransaction({
          to: token.address,
          value: ethers.utils.parseEther("10"),
        })
      ).to.be.revertedWith("Only if you mint");
      const balanceOwnerETHAfter = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceContractETHAfter = await ethers.provider.getBalance(
        token.address
      );
      expect(balanceOwnerETHBefore).to.equal(balanceOwnerETHAfter);
      expect(balanceContractETHBefore)
        .to.equal(balanceContractETHAfter)
        .to.equal(0);
    });
  });
});
