import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeUSDT } from "../../typechain-types/contracts";

export default function FakeUSDT() {
  describe("FakeUSDT", function () {
    let token: FakeUSDT;

    before(async function () {
      [this.owner, this.investor, this.toto] = await ethers.getSigners();
      const FakeUSDT = await ethers.getContractFactory("FakeUSDT");
      token = await FakeUSDT.deploy();
    });

    describe("Deploy Verification", function () {
      it("Should get 6 decimals", async function () {
        expect(await token.decimals()).to.equal(6);
      });

      it("Should get balance of owner", async function () {
        expect((await token.balanceOf(this.owner.address)).toString()).to.equal(
          ethers.utils.parseUnits((1e6).toString(), 6)
        );
      });
    });

    describe("Mint", function () {
      it("Should mint X tokens", async function () {
        let tx = await token.mint(
          this.owner.address,
          ethers.utils.parseUnits((1e6).toString(), 6)
        );
        await tx.wait();
        expect((await token.balanceOf(this.owner.address)).toString()).to.equal(
          ethers.utils.parseUnits((2e6).toString(), 6)
        );
      });
    });
  });
}