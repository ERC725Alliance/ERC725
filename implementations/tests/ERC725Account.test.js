const { assert } = require("chai");
const { BN, ether, expectRevert } = require("openzeppelin-test-helpers");
const { getEncodedCall, checkErrorRevert } = require("../helpers/utils");
const { calculateCreate2 } = require("eth-create2-calculator");

const AccountContract = artifacts.require("ERC725Account");

const CounterContract = artifacts.require("Counter");
const SimpleKeyManager = artifacts.require("SimpleKeyManager");
const UniversalReceiver1 = artifacts.require("UniversalReceiverDelegate1");
const UniversalReceiver2 = artifacts.require("UniversalReceiverDelegate2");
const ReturnTest = artifacts.require("ReturnTest");

const { INTERFACE_ID, ERC1271 } = require("../utils/constants");
const { web3 } = require("openzeppelin-test-helpers/src/setup");

// keccak256("EXECUTOR_ROLE")
const EXECUTOR_ROLE =
  "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const DUMMY_PRIVATEKEY =
  "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";
const UniversalReceiverDelegateKey =
  "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";

// generate an Account
const DUMMY_SIGNER = web3.eth.accounts.wallet.add(DUMMY_PRIVATEKEY);

const OPERATION_CALL = 0;
const OPERATION_CREATE = 1;

let ERC725AccountIdentifier = [
  web3.utils.keccak256("ERC725Account").substr(0, 10),
];
let supportStandardsKey = [
  web3.utils.keccak256("SupportedStandards").substr(0, 34) +
    "0".repeat(24) +
    ERC725AccountIdentifier[0].replace("0x", ""),
];

contract("ERC725", (accounts) => {
  let owner = accounts[0],
    nonOwner = accounts[1];

  let Account, Counter;

  beforeEach(async function () {
    // Deploy contracts
    await AccountContract.detectNetwork();
    Account = await AccountContract.new(owner);
    Counter = await CounterContract.new();
    UniversalR1 = await UniversalReceiver1.new();
    UniversalR2 = await UniversalReceiver2.new();
  });

  it("should allow the owner to call execute", async function () {
    // Counter should be 0 initially
    assert.equal((await Counter.get()).toString(), "0");

    // Call Counter.increment from Account
    const encodedCall = getEncodedCall(Counter, "increment");
    await Account.execute(OPERATION_CALL, Counter.address, 0, encodedCall, {
      from: owner,
    });

    // Check that increment was called
    assert.equal((await Counter.get()).toString(), "1");
  });

  it("should not allow non-owner to call execute", async function () {
    // Counter should be 0 initially
    assert.equal((await Counter.get()).toString(), "0");

    // Calling Counter.increment from Account should fail
    const encodedCall = getEncodedCall(Counter, "increment");
    await checkErrorRevert(
      Account.execute(OPERATION_CALL, Counter.address, 0, encodedCall, {
        from: nonOwner,
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
      from: nonOwner,
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
      from: owner,
      to: Account.address,
      value: oneEth,
    });

    // We have 1 ether
    assert.equal(oneEth, await web3.eth.getBalance(Account.address));

    // Sending 1 ether
    await Account.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {
      from: owner,
    });

    // We have 0 ether
    assert.equal(zeroEth, await web3.eth.getBalance(Account.address));

    // Sending 1 ether directly from the owner and pass on
    await Account.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {
      from: owner,
      value: oneEth,
    });

    // We have 0 ether
    assert.equal(zeroEth, await web3.eth.getBalance(Account.address));

    // contract received 1 ether
    assert.equal(twoEth, await web3.eth.getBalance(Counter.address));
  });
});

contract("ERC725Account", (accounts) => {
  let owner = accounts[0];
  let nonOwner = accounts[1];
  let recipient = accounts[2];

  let Account;

  before(async function () {
    Account = await AccountContract.new(owner, { from: owner });
  });

  context("Account Deployment", async () => {
    it("Deploys correctly, and compare owners", async () => {
      const newAccount = await AccountContract.new(owner, { from: owner });
      const accountOwner = await newAccount.owner.call();

      assert.equal(accountOwner, owner, "Addresses should match");
    });
  });

  context("ERC165", async () => {
    it("Supports ERC165", async () => {
      assert.isTrue(await Account.supportsInterface.call(INTERFACE_ID.ERC165));
    });

    it("Supports ERC725X", async () => {
      assert.isTrue(await Account.supportsInterface.call(INTERFACE_ID.ERC725X));
    });

    it("Supports ERC725Y", async () => {
      assert.isTrue(await Account.supportsInterface.call(INTERFACE_ID.ERC725Y));
    });

    it("Supports ERC1271", async () => {
      assert.isTrue(await Account.supportsInterface.call(INTERFACE_ID.ERC1271));
    });

    it("Supports ERC725Account", async () => {
      assert.isTrue(
        await Account.supportsInterface.call(INTERFACE_ID.ERC725Account)
      );
    });

    it("Supports LSP1", async () => {
      assert.isTrue(await Account.supportsInterface.call(INTERFACE_ID.LSP1));
    });
  });

  context("ERC1271", async () => {
    const dataToSign = "0xcafecafe";
    it("Can verify signature from owner", async () => {
      const Account = await AccountContract.new(DUMMY_SIGNER.address, {
        from: owner,
      });

      const signature = DUMMY_SIGNER.sign(dataToSign);

      const result = await Account.isValidSignature.call(
        signature.messageHash,
        signature.signature
      );

      assert.equal(
        result,
        ERC1271.MAGIC_VALUE,
        "Should define the signature as valid"
      );
    });
    it("Should fail when verifying signature from not-owner", async () => {
      const Account = await AccountContract.new(owner, { from: owner });
      const signature = DUMMY_SIGNER.sign(dataToSign);

      const result = await Account.isValidSignature.call(
        signature.messageHash,
        signature.signature
      );

      assert.equal(
        result,
        ERC1271.FAIL_VALUE,
        "Should define the signature as invalid"
      );
    });
  });

  context("Interactions with Account contract", async () => {
    it("Owner can set data", async () => {
      const key = [web3.utils.asciiToHex("Important Data")];
      const data = [web3.utils.asciiToHex("Important Data")];

      await Account.setData(key, data, { from: owner });

      let fetchedData = await Account.getData(key);
      assert.deepEqual(data, fetchedData);
    });

    it("Fails when non-owner sets data", async () => {
      const key = [web3.utils.asciiToHex("Important Data")];
      const data = [web3.utils.asciiToHex("Important Data")];

      await expectRevert(
        Account.setData(key, data, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
    });

    it("Allows owner to execute calls", async () => {
      let amount = ether("1");

      await web3.eth.sendTransaction({
        from: owner,
        to: Account.address,
        value: amount,
      });

      let recipientBalanceInitial = await web3.eth.getBalance(recipient);

      await Account.execute(OPERATION_CALL, recipient, amount, "0x", {
        from: owner,
      });

      let recipientBalanceFinal = await web3.eth.getBalance(recipient);

      assert.isTrue(
        new BN(recipientBalanceInitial)
          .add(amount)
          .eq(new BN(recipientBalanceFinal))
      );
    });

    it("Should revert when calling a function that reverts", async () => {
      returnTest = await ReturnTest.new({ from: owner });
      abi = returnTest.contract.methods
        .functionThatRevertsWithError("Yamen")
        .encodeABI();

      await expectRevert(
        Account.execute(OPERATION_CALL, returnTest.address, "0x0", abi, {
          from: owner,
        }),
        "Yamen"
      );
    });

    it("Fails with non-owner executing", async () => {
      let amount = ether("1");

      // send money to the Account
      await web3.eth.sendTransaction({
        from: owner,
        to: Account.address,
        value: amount,
      });

      // try to move it away
      await expectRevert(
        Account.execute(OPERATION_CALL, recipient, amount, "0x", {
          from: nonOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("Allows owner to execute create", async () => {
      let receipt = await Account.execute(
        OPERATION_CREATE,
        recipient,
        "0",
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6",
        {
          from: owner,
        }
      );

      assert.equal(receipt.logs[0].event, "ContractCreated");
      assert.equal(receipt.logs[0].args._operation, OPERATION_CREATE);
      assert.equal(receipt.logs[0].args._value, "0");
    });

    it("Allows owner to execute create2", async () => {
      const bytecode =
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6";
      const salt =
        "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
      const data = bytecode + salt;
      const OPERATION_CREATE2 = 2;

      // deploy with added 32 bytes salt
      let receipt = await Account.execute(OPERATION_CREATE2, owner, "0", data, {
        from: owner,
      });
      const precomputed = calculateCreate2(
        Account.address,
        "0x" + salt,
        bytecode
      );
      assert.equal(receipt.logs[0].event, "ContractCreated");
      assert.equal(receipt.logs[0].args._operation, OPERATION_CREATE2);
      assert.equal(receipt.logs[0].args._contractAddress, precomputed);
      assert.equal(receipt.logs[0].args._value, "0");
    });
  });

  context("Testing UniversalReceiver", async () => {
    beforeEach(async () => {
      await AccountContract.detectNetwork();
      Account = await AccountContract.new(owner);
      UniversalR1 = await UniversalReceiver1.new();
      UniversalR2 = await UniversalReceiver2.new();
    });

    it("Call the universal receiver and return data", async () => {
      let key = [UniversalReceiverDelegateKey];
      let value = [UniversalR1.address];
      await Account.setData(key, value, { from: owner });

      let result = await Account.universalReceiver.call(
        UniversalReceiverDelegateKey,
        "0x0",
        { from: owner }
      );
      assert(result != "0x0");
    });

    it("Call the universal receiver and revert", async () => {
      let key = [UniversalReceiverDelegateKey];
      let value = [UniversalR2.address];
      await Account.setData(key, value, { from: owner });

      await expectRevert(
        Account.universalReceiver.call(UniversalReceiverDelegateKey, "0x", {
          from: owner,
        }),
        "This Contract reverts"
      );
    });
  });

  context("Using KeyManager as owner", async () => {
    let KeyManager;
    let Account;

    let owner = accounts[6];

    const dataToSign = "0xcafecafe";

    beforeEach(async () => {
      Account = await AccountContract.new(owner, { from: owner });
      KeyManager = await SimpleKeyManager.new(Account.address, owner, {
        from: owner,
      });
      await Account.transferOwnership(KeyManager.address, { from: owner });
    });

    it("Account should have owner as KeyManager", async () => {
      const accountOwner = await Account.owner.call();
      assert.equal(accountOwner, KeyManager.address, "Addresses should match");
    });

    it("Key Manager can execute on behalf of Identity", async () => {
      let recipient = accounts[1];
      let amount = ether("1");

      // Fund Account contract
      await web3.eth.sendTransaction({
        from: owner,
        to: Account.address,
        value: amount,
      });

      let recipientBalanceInitial = await web3.eth.getBalance(recipient);
      let accountBalanceInitial = await web3.eth.getBalance(Account.address);
      let keyManagerBalanceInitial = await web3.eth.getBalance(
        KeyManager.address
      );

      let payload = Account.contract.methods
        .execute(OPERATION_CALL, recipient, amount.toString(), "0x")
        .encodeABI();

      await KeyManager.execute(payload, {
        from: owner,
      });

      let recipientBalanceFinal = await web3.eth.getBalance(recipient);
      let accountBalanceFinal = await web3.eth.getBalance(Account.address);
      let keyManagerBalanceFinal = await web3.eth.getBalance(
        KeyManager.address
      );

      assert.equal(
        keyManagerBalanceInitial,
        keyManagerBalanceFinal,
        "manager balance shouldn't have changed"
      );

      assert.isTrue(
        new BN(recipientBalanceInitial)
          .add(amount)
          .eq(new BN(recipientBalanceFinal)),
        `Recipient address should have received ${amount} ethers`
      );

      assert.isTrue(
        new BN(accountBalanceInitial)
          .sub(amount)
          .eq(new BN(accountBalanceFinal)),
        `Account should have sent ${amount} ethers`
      );
    });

    context("ERC1271 from KeyManager", async () => {
      it("Can verify signature from executor of KeyManager", async () => {
        const signature = DUMMY_SIGNER.sign(dataToSign);

        // add new owner to keyManager
        await KeyManager.grantRole(EXECUTOR_ROLE, DUMMY_SIGNER.address, {
          from: owner,
        });

        const result = await Account.isValidSignature.call(
          signature.messageHash,
          signature.signature
        );

        assert.equal(
          result,
          ERC1271.MAGIC_VALUE,
          "Should define the signature as valid"
        );
      });

      it("Can verify signature from owner of KeyManager", async () => {
        Account = await AccountContract.new(owner, { from: owner });
        KeyManager = await SimpleKeyManager.new(
          Account.address,
          DUMMY_SIGNER.address,
          {
            from: owner,
          }
        );
        await Account.transferOwnership(KeyManager.address, { from: owner });

        const signature = DUMMY_SIGNER.sign(dataToSign);

        const result = await Account.isValidSignature.call(
          signature.messageHash,
          signature.signature
        );

        assert.equal(
          result,
          ERC1271.MAGIC_VALUE,
          "Should define the signature as valid"
        );
      });
      it("Should fail when verifying signature from not-owner", async () => {
        const signature = DUMMY_SIGNER.sign(dataToSign);

        const result = await KeyManager.isValidSignature.call(
          signature.messageHash,
          signature.signature
        );

        assert.equal(
          result,
          ERC1271.FAIL_VALUE,
          "Should define the signature as invalid"
        );
      });
    });
  });
});

contract("ERC725Account with ownership upgrade", (accounts) => {
  let previousOwner = accounts[2];
  let newOwner = accounts[3];
  let nonOwner = accounts[4];

  let Account;

  before(async () => {
    Account = await AccountContract.new(previousOwner, {
      from: previousOwner,
    });
  });

  it("Upgrade ownership correctly", async () => {
    await Account.transferOwnership(newOwner, { from: previousOwner });
    const accountOwner = await Account.owner.call();

    assert.equal(accountOwner, newOwner, "Addresses should match");
  });

  it("Refuse upgrades from non-onwer", async () => {
    await expectRevert(
      Account.transferOwnership(newOwner, { from: nonOwner }),
      "Ownable: caller is not the owner"
    );
  });
});
