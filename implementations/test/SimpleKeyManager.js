const {expectRevert} = require("openzeppelin-test-helpers");

const Account = artifacts.require("ERC725Account");
const KeyManager = artifacts.require('SimpleKeyManager');

// keccak256("EXECUTOR_ROLE")
const EXECUTOR_ROLE = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const DEFAULT_ADMIN_ROLE = "0x00";

contract("SimpleKeyManager", async (accounts) => {
    let keyManager, account;
    const owner = accounts[2];

    beforeEach(async () => {
        account = await Account.new(owner, {from: owner});
        keyManager = await KeyManager.new(account.address, owner);
        await account.transferOwnership(keyManager.address, {from: owner});

        // console.log(await keyManager.getRoleAdmin(EXECUTOR_ROLE));
        // console.log(await keyManager.getRoleAdmin(DEFAULT_ADMIN_ROLE));
    });

    it('check if owners are correct', async function() {
        assert.equal(await account.owner(), keyManager.address);
        assert.isTrue(await keyManager.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assert.isTrue(await keyManager.hasRole(EXECUTOR_ROLE, owner));
    });

    it('should be able to add second owner', async function() {

        // add owner
        keyManager.grantRole(DEFAULT_ADMIN_ROLE, accounts[4], {from: owner});

        assert.isTrue(await keyManager.hasRole(DEFAULT_ADMIN_ROLE, accounts[4]));
    });

    it('second owner should be be able to add executor', async function() {

        // add owner
        keyManager.grantRole(DEFAULT_ADMIN_ROLE, accounts[4], {from: owner});

        // add executor
        keyManager.grantRole(EXECUTOR_ROLE, accounts[5], {from: accounts[4]});

        assert.isTrue(await keyManager.hasRole(EXECUTOR_ROLE, accounts[5]));
    });

    it('executor should not be able to add owner', async function() {

        // add owner
        keyManager.grantRole(DEFAULT_ADMIN_ROLE, accounts[4], {from: owner});

        // add executor
        keyManager.grantRole(EXECUTOR_ROLE, accounts[5], {from: accounts[4]});

        // add owner
        expectRevert(
            keyManager.grantRole(EXECUTOR_ROLE, accounts[6], {from: accounts[5]}),
            "AccessControl: sender must be an admin to grant"
        );

    });


    it('should be able to send value to the account and forward', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();
        await keyManager.execute(abi, {from: owner});

        assert.equal(await web3.eth.getBalance(account.address), '0');
    });

    it('should fail to send value if not executor', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        // remove executor
        keyManager.revokeRole(EXECUTOR_ROLE, owner, {from: owner});

        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();

        await expectRevert(
            keyManager.execute(abi, {from: owner}),
            "Only executors are allowed"
        );

        assert.equal(await web3.eth.getBalance(account.address), oneEth);
    });

    it('using a signed relayExecution, should be able to send value to the account and forward', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');
        web3.eth.accounts.wallet.create(1);
        let emptyAccount = web3.eth.accounts.wallet[0];

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        // add a new executor
        await keyManager.grantRole(EXECUTOR_ROLE, emptyAccount.address, {from: owner});

        // sign execution
        let nonce = await keyManager.getNonce(emptyAccount.address);

        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();
        let signature = emptyAccount.sign(
            web3.utils.soliditySha3(keyManager.address, {t: 'bytes', v: abi}, nonce)
        );

        // send from non-executor account, adding signed data
        await keyManager.executeRelayedCall(keyManager.address, abi, nonce, signature.signature, {from: accounts[4]});

        assert.equal(await web3.eth.getBalance(account.address), '0');
    });

    it('using a signed relayExecution, should fail wrong nonce', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');
        web3.eth.accounts.wallet.create(1);
        let emptyAccount = web3.eth.accounts.wallet[0];

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        // add a new executor
        await keyManager.grantRole(EXECUTOR_ROLE, emptyAccount.address, {from: owner});

        // sign execution
        let nonce = await keyManager.getNonce(emptyAccount.address) + 2; // increase to much
        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();
        let signature = emptyAccount.sign(
            web3.utils.soliditySha3(keyManager.address, {t: 'bytes', v:abi}, nonce)
        );

        // send from non-executor account, adding signed data
        await expectRevert(
            keyManager.executeRelayedCall(keyManager.address, abi, nonce, signature.signature, {from: accounts[4]}),
            "Incorrect nonce"
        );

        assert.equal(await web3.eth.getBalance(account.address), oneEth);
    });

    it('using a signed relayExecution, should fail to send value if not executor', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');
        web3.eth.accounts.wallet.create(1);
        let emptyAccount = web3.eth.accounts.wallet[0];

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        // dont add new executor

        // sign execution
        let nonce = await keyManager.getNonce(emptyAccount.address);
        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();
        let signature = emptyAccount.sign(
            web3.utils.soliditySha3(keyManager.address, {t: 'bytes', v: abi}, nonce)
        );

        // send from non-executor account, adding signed data
        await expectRevert(
            keyManager.executeRelayedCall(keyManager.address, abi, nonce, signature.signature, {from: accounts[4]}),
            "Only executors are allowed"
        );

        assert.equal(await web3.eth.getBalance(account.address), oneEth);
    });

    it('using a signed relayExecution, should fail to send value if not signedFor keyManager is wrong', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');
        web3.eth.accounts.wallet.create(1);
        let emptyAccount = web3.eth.accounts.wallet[0];

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        // add a new executor
        await keyManager.grantRole(EXECUTOR_ROLE, emptyAccount.address, {from: owner});

        // sign execution
        let nonce = await keyManager.getNonce(emptyAccount.address);
        let abi = account.contract.methods.execute("0", accounts[2], oneEth, '0x00').encodeABI();
        let signature = emptyAccount.sign(
            web3.utils.soliditySha3(accounts[5], {t: 'bytes', v: abi}, nonce) // accounts[5] is not the keyManager address
        );

        // send from non-executor account, adding signed data
        await expectRevert(
            keyManager.executeRelayedCall(accounts[5], abi, nonce, signature.signature, {from: accounts[4]}),
            "Message not signed for this keyManager"
        );

        assert.equal(await web3.eth.getBalance(account.address), oneEth);
    });

});
