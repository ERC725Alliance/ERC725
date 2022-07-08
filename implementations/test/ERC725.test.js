const { assert } = require("chai");

const { BN, expectRevert } = require("openzeppelin-test-helpers");

const { INTERFACE_ID } = require("../constants");

const ERC725 = artifacts.require("ERC725");
const ERC725Init = artifacts.require("ERC725Init");

contract("ERC725", (accounts) => {
  const nonOwner = accounts[1];
  const owner = accounts[0];

  let erc725;

  context("after deploying the contract", async () => {
    before(async () => {
      erc725 = await ERC725.new(owner, { from: owner });
    });
    it("should have set the contract owner correctly", async () => {
      const accountOwner = await erc725.owner.call();
      assert.equal(accountOwner, owner, "Addresses should match");
    });
  });

  context("ERC165", async () => {
    before(async () => {
      erc725 = await ERC725.new(owner, { from: owner });
    });
    it("Supports ERC165", async () => {
      assert.isTrue(await erc725.supportsInterface.call(INTERFACE_ID.ERC165));
    });
    it("Supports ERC725X", async () => {
      assert.isTrue(await erc725.supportsInterface.call(INTERFACE_ID.ERC725X));
    });

    it("Supports ERC725Y", async () => {
      assert.isTrue(await erc725.supportsInterface.call(INTERFACE_ID.ERC725Y));
    });
  });
});

contract("ERC725Init", (accounts) => {
  context("after deploying the base contract", async () => {
    before(async () => {
      erc725Init = await ERC725Init.new();
    });
    it("should have initialized (= locked) the base contract", async () => {
      const isInitialized = await erc725Init.initialized.call();
      assert.equal(isInitialized.toNumber(), 255);
    });

    it("should have set the owner of the base contract as the zero-address", async () => {
      const owner = await erc725Init.owner.call();
      assert.equal(owner, "0x0000000000000000000000000000000000000000");
    });

    it("should not be possible to call `initialize(...)` on the base contract", async () => {
      await expectRevert(
        erc725Init.initialize(accounts[0], { from: accounts[0] }),
        "Initializable: contract is already initialized"
      );
    });
  });

  context("ERC165", async () => {
    before(async () => {
      erc725Init = await ERC725Init.new();
    });
    it("Supports ERC165", async () => {
      assert.isTrue(
        await erc725Init.supportsInterface.call(INTERFACE_ID.ERC165)
      );
    });
    it("Supports ERC725X", async () => {
      assert.isTrue(
        await erc725Init.supportsInterface.call(INTERFACE_ID.ERC725X)
      );
    });

    it("Supports ERC725Y", async () => {
      assert.isTrue(
        await erc725Init.supportsInterface.call(INTERFACE_ID.ERC725Y)
      );
    });
  });
});
