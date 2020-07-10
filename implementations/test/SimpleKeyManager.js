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
    });

    it('check if owners are correct', async function() {
        assert.equal(await account.owner(), keyManager.address);
        assert.isTrue(await keyManager.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assert.isTrue(await keyManager.hasRole(EXECUTOR_ROLE, owner));
    });

    it('should be able to send value to the account and forward', async function() {
        let oneEth = web3.utils.toWei("1", 'ether');

        await web3.eth.sendTransaction({
            from: accounts[2],
            to: account.address,
            value: oneEth
        });

        assert.equal(await web3.eth.getBalance(account.address), oneEth);

        await keyManager.execute("0", accounts[2], oneEth, '0x00', {from: owner});

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
        keyManager.revokeRole(EXECUTOR_ROLE, owner, {from: owner}),

            await expectRevert(
                keyManager.execute("0", accounts[2], oneEth, '0x00', {from: owner}),
                "Only executors are allowed"
            );

        assert.equal(await web3.eth.getBalance(account.address), oneEth);
    });

});
