const { assert } = require("chai");
const {
  singletons,
  BN,
  ether,
  expectRevert,
} = require("openzeppelin-test-helpers");
const { getEncodedCall, checkErrorRevert } = require("../helpers/utils");

const AccountContract = artifacts.require("ERC725Y");

const ERC725YWriter = artifacts.require("ERC725YWriter");
const ERC725YReader = artifacts.require("ERC725YReader");

contract("ERC725Y", (accounts) => {
  let erc1820;
  beforeEach(async function() {
    erc1820 = await singletons.ERC1820Registry(accounts[1]);
  });

  context("Account Deployment", async () => {
    it("Deploys correctly, and compare owners", async () => {
      const owner = accounts[2];
      const account = await AccountContract.new(owner, { from: owner });

      const idOwner = await account.owner.call();

      assert.equal(idOwner, owner, "Addresses should match");
    });
  });

  context("ERC165", async () => {
    it("Supports ERC165", async () => {
      const owner = accounts[2];
      const account = await AccountContract.new(owner, { from: owner });
      const interfaceID = "0x01ffc9a7";

      const result = await account.supportsInterface.call(interfaceID);

      assert.isTrue(result);
    });

    it("Supports ERC725Y", async () => {
      const owner = accounts[2];
      const account = await AccountContract.new(owner, { from: owner });
      const interfaceID = "0x5a988c0f";

      const result = await account.supportsInterface.call(interfaceID);

      assert.isTrue(result);
    });
  });

  context("Storage test", async () => {
    let account;
    let owner = accounts[2];
    let count = 1000000000;
    let keys = [];
    let values = [];

    it("Create account", async () => {
      account = await AccountContract.new(owner, { from: owner });

      assert.equal(await account.owner.call(), owner);
    });

    context("Interacting from a EOA", async () => {
      it("Store 32 bytes item 1", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [web3.utils.numberToHex(count++)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Store 32 bytes item 2", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [web3.utils.numberToHex(count++)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Store 32 bytes item 3", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [web3.utils.numberToHex(count++)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Store 32 bytes item 4", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [web3.utils.numberToHex(count++)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Store a long URL as bytes item 5: https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [
          web3.utils.utf8ToHex(
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
          ),
        ];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });

      it("Store 32 bytes item 6", async () => {
        let key = [web3.utils.numberToHex(count)];
        let value = [web3.utils.numberToHex(count)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Update 32 bytes item 6", async () => {
        let key = [web3.utils.numberToHex(count)];
        let value = [web3.utils.numberToHex(count)];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });
      it("Store a long Paragraph as bytes", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [
          web3.utils.utf8ToHex(
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          ),
        ];
        await account.setData(key, value, { from: owner });

        assert.deepEqual(await account.getData(key), value);
      });

      it("Store 3 items of different bytes-lengths", async () => {
        let multipleKeys = [
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        ];
        let multipleValues = [
          "0xabcdef",
          "0x0123456789abcdef",
          "0xabcdefabcdefabcdef123456789123456789",
        ];
        await account.setData(multipleKeys, multipleValues, { from: owner });

        assert.deepEqual(await account.getData(multipleKeys), multipleValues);
      });

      it("Revert when Keys length is not equal to values length", async () => {
        let multipleKeys = [
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        ];
        let multipleValues = [
          "0xabcdef",
          "0x0123456789abcdef",
          "0xabcdefabcdefabcdef123456789123456789",
          "0xabcdefabcdefabcdef123456789123456789",
        ];
        await expectRevert(
          account.setData(multipleKeys, multipleValues, { from: owner }),
          "Keys length not equal to values length"
        );
      });
    });

    context("Interacting from Smart contracts", async () => {
      let account;
      let erc725YWriter;
      let erc725YReader;

      beforeEach(async () => {
        erc725YWriter = await ERC725YWriter.new();
        erc725YReader = await ERC725YReader.new();

        account = await AccountContract.new(erc725YWriter.address, {
          from: owner,
        });
        assert.equal(await account.owner.call(), erc725YWriter.address);
      });

      it("Should be able to setData and getData of 3 assets from Smart contracts", async () => {
        let keys = [];
        let values = [];
        for (let i = 8; i <= 10; i++) {
          keys.push(web3.utils.numberToHex(count++));
          values.push(web3.utils.numberToHex(count + 1000));
        }
        await erc725YWriter.CallSetData(account.address, keys, values);

        const result = await erc725YReader.CallGetData(account.address, keys);
        assert.deepEqual(result, values);
      });

      it("Should be able to setData (Array of 3 assets of different lengths) from Smart contracts", async () => {
        let multipleKeys = [
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        ];
        let multipleValues = [
          "0xabcdef",
          "0x0123456789abcdef",
          "0xabcdefabcdefabcdef123456789123456789",
        ];
        await erc725YWriter.CallSetData(
          account.address,
          multipleKeys,
          multipleValues
        );

        let fetchedResult = await erc725YReader.CallGetData(
          account.address,
          multipleKeys
        );
        assert.deepEqual(fetchedResult, multipleValues);
      });

      it("Should be able to setData and getData of 1 asset from Smart contracts", async () => {
        let key = [web3.utils.numberToHex(count++)];
        let value = [web3.utils.numberToHex(count + 11)];

        await erc725YWriter.CallSetData(account.address, key, value);

        const result = await erc725YReader.CallGetData(account.address, key);
        assert.deepEqual(result, value);
      });

      it("Should be able to setData constructed in a smart contract",async()=>{
        const Key = [web3.utils.keccak256("MyName")];
        const value = [web3.utils.utf8ToHex("LUKSO")];

        await erc725YWriter.setDataComputed(account.address);
        const result = await erc725YReader.CallGetData(account.address,Key);
        assert.deepEqual(result,value);
      })
    });
  });

  context("Interactions with Account contracts", async () => {
    const owner = accounts[3];
    const newOwner = accounts[5];
    let account = {};

    beforeEach(async () => {
      account = await AccountContract.new(owner, { from: owner });
    });

    it("Uprade ownership correctly", async () => {
      await account.transferOwnership(newOwner, { from: owner });
      const idOwner = await account.owner.call();

      assert.equal(idOwner, newOwner, "Addresses should match");
    });

    it("Refuse upgrades from non-onwer", async () => {
      await expectRevert(
        account.transferOwnership(newOwner, { from: newOwner }),
        "Ownable: caller is not the owner"
      );
    });

    it("Owner can set data", async () => {
      const key = [web3.utils.asciiToHex("Important Data")];
      const data = [web3.utils.asciiToHex("Important Data")];

      await account.setData(key, data, { from: owner });

      let fetchedData = await account.getData(key);

      assert.deepEqual(data, fetchedData);
    });

    it("Fails when non-owner sets data", async () => {
      const key = [web3.utils.asciiToHex("Important Data")];
      const data = [web3.utils.asciiToHex("Important Data")];

      await expectRevert(
        account.setData(key, data, { from: newOwner }),
        "Ownable: caller is not the owner"
      );
    });
  });
});
