const {
  singletons,
  BN,
  ether,
  expectRevert,
} = require("openzeppelin-test-helpers");
const { getEncodedCall, checkErrorRevert } = require("../helpers/utils");

const AccountContract = artifacts.require("ERC725Account");
const CounterContract = artifacts.require("Counter");
const KeyManager = artifacts.require("SimpleKeyManager");
const ERC725YOwner = artifacts.require("ERC725YOwner");
const ERC725YReader = artifacts.require("ERC725YReader");

// keccak256("EXECUTOR_ROLE")
const EXECUTOR_ROLE =
  "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const ERC1271_MAGIC_VALUE = "0x1626ba7e";
const ERC1271_FAIL_VALUE = "0xffffffff";
const RANDOM_BYTES32 =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
const DUMMY_PRIVATEKEY =
  "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";
// generate an account
const DUMMY_SIGNER = web3.eth.accounts.wallet.add(DUMMY_PRIVATEKEY);

const OPERATION_CALL = 0;

let ERC725AccountIdentifier = [
  web3.utils.keccak256("ERC725Account").substr(0, 10),
];
let supportStandardsKey = [
  web3.utils.keccak256("SupportedStandards").substr(0, 34) +
    "0".repeat(24) +
    ERC725AccountIdentifier[0].replace("0x", ""),
];

contract("ERC725", function(accounts) {
  let Account, Counter;

  context("Simple tests", async () => {
    beforeEach(async function() {
      // Deploy contracts
      Account = await AccountContract.new(accounts[0]);
      Counter = await CounterContract.new();
    });

    it("should allow the owner to call execute", async function() {
      // Counter should be 0 initially
      assert.equal((await Counter.get()).toString(), "0");

      // Call Counter.increment from Account
      const encodedCall = getEncodedCall(Counter, "increment");
      await Account.execute(OPERATION_CALL, Counter.address, 0, encodedCall, {
        from: accounts[0],
      });

      // Check that increment was called
      assert.equal((await Counter.get()).toString(), "1");
    });

    it("should not allow non-owner to call execute", async function() {
      // Counter should be 0 initially
      assert.equal((await Counter.get()).toString(), "0");

      // Calling Counter.increment from Account should fail
      const encodedCall = getEncodedCall(Counter, "increment");
      await checkErrorRevert(
        Account.execute(OPERATION_CALL, Counter.address, 0, encodedCall, {
          from: accounts[1],
        }),
        "Ownable: caller is not the owner"
      );

      // Check that increment was not called
      assert.equal((await Counter.get()).toString(), "0");
    });

    it("should receive ether correctly", async () => {
      // Checking that balance of Identity contract is 0.
      var oneEth = web3.utils.toWei("1", "ether");
      const actualBalance = await web3.eth.getBalance(Account.address);
      assert.equal(actualBalance.toString(), "0");

      // Sending ether to the Account contract.
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: Account.address,
        value: oneEth,
      });

      // Check Identity contract has received the ether.
      assert.equal(oneEth, await web3.eth.getBalance(Account.address));
    });

    it("should allow owner to send ether", async () => {
      let twoEth = await web3.utils.toWei("2", "ether");
      let oneEth = await web3.utils.toWei("1", "ether");
      let zeroEth = await web3.utils.toWei("0", "ether");

      await web3.eth.sendTransaction({
        from: accounts[1],
        to: Account.address,
        value: oneEth,
      });

      // We have 1 ether
      assert.equal(oneEth, await web3.eth.getBalance(Account.address));

      // Sending 1 ether
      await Account.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {
        from: accounts[0],
      });

      // We have 0 ether
      assert.equal(zeroEth, await web3.eth.getBalance(Account.address));

      // Sending 1 ether directly from the owner and pass on
      await Account.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {
        from: accounts[0],
        value: oneEth,
      });

      // We have 0 ether
      assert.equal(zeroEth, await web3.eth.getBalance(Account.address));

      // contract received 1 ether
      assert.equal(twoEth, await web3.eth.getBalance(Counter.address));
    });
  }); // context simple test

  contract("Account", (accounts) => {
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
      it("Supports ERC725X", async () => {
        const owner = accounts[2];
        const account = await AccountContract.new(owner, { from: owner });
        const interfaceID = "0x44c028fe";

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
      it("Supports ERC1271", async () => {
        const owner = accounts[2];
        const account = await AccountContract.new(owner, { from: owner });
        const interfaceID = "0x1626ba7e";

        const result = await account.supportsInterface.call(interfaceID);

        assert.isTrue(result);
      });
    });

    context("ERC1271", async () => {
      it("Can verify signature from owner", async () => {
        const owner = accounts[2];
        const account = await AccountContract.new(DUMMY_SIGNER.address, {
          from: owner,
        });
        const dataToSign = "0xcafecafe";
        const signature = DUMMY_SIGNER.sign(dataToSign);

        const result = await account.isValidSignature.call(
          signature.messageHash,
          signature.signature
        );

        assert.equal(
          result,
          ERC1271_MAGIC_VALUE,
          "Should define the signature as valid"
        );
      });
      it("Should fail when verifying signature from not-owner", async () => {
        const owner = accounts[2];
        const account = await AccountContract.new(owner, { from: owner });
        const dataToSign = "0xcafecafe";
        const signature = DUMMY_SIGNER.sign(dataToSign);

        const result = await account.isValidSignature.call(
          signature.messageHash,
          signature.signature
        );

        assert.equal(
          result,
          ERC1271_FAIL_VALUE,
          "Should define the signature as invalid"
        );
      });
    });

    context("Storage test", async () => {
      let owner = accounts[2];
      let count = 1000000000;

      it("Check for key: SupportedStandards > ERC725Account value: bytes4(keccak256('ERC725Account')):", async () => {
        const account = await AccountContract.new(owner, { from: owner });

        assert.deepEqual(
          await account.getData(supportStandardsKey),
          ERC725AccountIdentifier
        );
      });

      context("Interacting from a EOA", async () => {
        let account;

        beforeEach(async () => {
          account = await AccountContract.new(owner, { from: owner });
          assert.equal(await account.owner.call(), owner);
        });

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
        let erc725YOwner;
        let erc725YReader;

        beforeEach(async () => {
          erc725YOwner = await ERC725YOwner.new();
          erc725YReader = await ERC725YReader.new();

          account = await AccountContract.new(erc725YOwner.address, {
            from: owner,
          });
          assert.equal(await account.owner.call(), erc725YOwner.address);
        });

        it("Should be able to setData and getData of 3 assets from Smart contracts", async () => {
          let keys = [];
          let values = [];
          for (let i = 8; i <= 10; i++) {
            keys.push(web3.utils.numberToHex(count++));
            values.push(web3.utils.numberToHex(count + 1000));
          }
          await erc725YOwner.CallSetData(account.address, keys, values);

          result = await erc725YReader.CallGetData(account.address, keys);
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
          await erc725YOwner.CallSetData(
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

          await erc725YOwner.CallSetData(account.address, key, value);

          result = await erc725YReader.CallGetData(account.address, key);
          assert.deepEqual(result, value);
        });
      });
    });

    context("Interactions with Account contracts", async () => {
      const owner = accounts[3];
      const newOwner = accounts[5];
      let account;

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

      it("Allows owner to execute calls", async () => {
        const dest = accounts[6];
        const amount = ether("10");
        const OPERATION_CALL = 0x0;

        await web3.eth.sendTransaction({
          from: owner,
          to: account.address,
          value: amount,
        });

        const destBalance = await web3.eth.getBalance(dest);

        await account.execute(OPERATION_CALL, dest, amount, "0x0", {
          from: owner,
        });

        const finalBalance = await web3.eth.getBalance(dest);

        assert.isTrue(new BN(destBalance).add(amount).eq(new BN(finalBalance)));
      });

      it("Fails with non-owner executing", async () => {
        const dest = accounts[6];
        const amount = ether("10");
        const OPERATION_CALL = 0x0;

        // send money to the account
        await web3.eth.sendTransaction({
          from: owner,
          to: account.address,
          value: amount,
        });

        // try to move it away
        await expectRevert(
          account.execute(OPERATION_CALL, dest, amount, "0x0", {
            from: newOwner,
          }),
          "Ownable: caller is not the owner"
        );
      });

      // TODO test delegateCall

      it("Allows owner to execute create", async () => {
        const dest = accounts[6];
        const amount = ether("10");
        const OPERATION_CREATE = 3;

        let receipt = await account.execute(
          OPERATION_CREATE,
          dest,
          "0",
          "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6",
          {
            from: owner,
          }
        );

        assert.equal(receipt.logs[1].event, "ContractCreated");
      });

      it("Allows owner to execute create2", async () => {
        const dest = accounts[6];
        const amount = ether("10");
        const OPERATION_CREATE2 = 2;

        // deploy with added 32 bytes salt
        let receipt = await account.execute(
          OPERATION_CREATE2,
          dest,
          "0",
          "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6" +
            // 32 bytes salt
            "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
          {
            from: owner,
          }
        );

        assert.equal(receipt.logs[1].event, "ContractCreated");
        assert.equal(
          receipt.logs[1].args.contractAddress,
          "0x7ffE4e82BD27654D31f392215b6b145655efe659"
        );
      });
    }); //Context interactions

    context("Using key manager as owner", async () => {
      let manager;
      let account;
      const owner = accounts[6];

      beforeEach(async () => {
        account = await AccountContract.new(owner, { from: owner });
        manager = await KeyManager.new(account.address, owner, { from: owner });
        await account.transferOwnership(manager.address, { from: owner });
      });

      it("Account should have owner as manager", async () => {
        const idOwner = await account.owner.call();
        assert.equal(idOwner, manager.address, "Addresses should match");
      });

      context("ERC1271 from KeyManager", async () => {
        it("Can verify signature from executor of keymanager", async () => {
          const dataToSign = "0xcafecafe";
          const signature = DUMMY_SIGNER.sign(dataToSign);

          // add new owner to keyManager
          await manager.grantRole(EXECUTOR_ROLE, DUMMY_SIGNER.address, {
            from: owner,
          });

          const result = await account.isValidSignature.call(
            signature.messageHash,
            signature.signature
          );

          assert.equal(
            result,
            ERC1271_MAGIC_VALUE,
            "Should define the signature as valid"
          );
        });
        it("Can verify signature from owner of keymanager", async () => {
          account = await AccountContract.new(owner, { from: owner });
          manager = await KeyManager.new(
            account.address,
            DUMMY_SIGNER.address,
            { from: owner }
          );
          await account.transferOwnership(manager.address, { from: owner });

          const dataToSign = "0xcafecafe";
          const signature = DUMMY_SIGNER.sign(dataToSign);

          const result = await account.isValidSignature.call(
            signature.messageHash,
            signature.signature
          );

          assert.equal(
            result,
            ERC1271_MAGIC_VALUE,
            "Should define the signature as valid"
          );
        });
        it("Should fail when verifying signature from not-owner", async () => {
          const dataToSign = "0xcafecafe";
          const signature = DUMMY_SIGNER.sign(dataToSign);

          const result = await manager.isValidSignature.call(
            signature.messageHash,
            signature.signature
          );

          assert.equal(
            result,
            ERC1271_FAIL_VALUE,
            "Should define the signature as invalid"
          );
        });
      });

      it("Key manager can execute on behalf of Idenity", async () => {
        const dest = accounts[1];
        const amount = ether("10");
        const OPERATION_CALL = 0x0;

        //Fund Account contract
        await web3.eth.sendTransaction({
          from: owner,
          to: account.address,
          value: amount,
        });

        // Initial Balances
        const destBalance = await web3.eth.getBalance(dest);
        const idBalance = await web3.eth.getBalance(account.address);
        const managerBalance = await web3.eth.getBalance(manager.address);

        let abi = account.contract.methods
          .execute(OPERATION_CALL, dest, amount.toString(), "0x00")
          .encodeABI();

        await manager.execute(abi, {
          from: owner,
        });

        //Final Balances
        const destBalanceFinal = await web3.eth.getBalance(dest);
        const idBalanceFinal = await web3.eth.getBalance(account.address);
        const managerBalanceFinal = await web3.eth.getBalance(manager.address);

        assert.equal(
          managerBalance,
          managerBalanceFinal,
          "manager balance shouldn't have changed"
        );

        assert.isTrue(
          new BN(destBalance).add(amount).eq(new BN(destBalanceFinal)),
          "Destination address should have recived amount"
        );

        assert.isTrue(
          new BN(idBalance).sub(amount).eq(new BN(idBalanceFinal)),
          "Account should have spent amount"
        );
      });
    });
  });
});
