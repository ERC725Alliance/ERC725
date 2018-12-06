const {reverting} = require('../node_modules/openzeppelin-solidity/test/helpers/shouldFail');
const createForwarder = require('../helpers/forwarder');

const web3 = require('web3');

const Identity = artifacts.require('Identity');
const KeyManager = artifacts.require('KeyManager');

contract('Forwarder', async (accounts) => {
  it('should be able to use Identity contract with forwarder', async () => {
    const identity = await Identity.new();
    const Forwarder = await createForwarder(identity.address);
    const forwarder = await Forwarder.new();

    const identityForwarder = await Identity.at(forwarder.address);
    await identityForwarder.initialise(accounts[0]);
    await reverting(identityForwarder.initialise(accounts[0]));

    await identityForwarder.setData('a', 'b');

    const owner = await identityForwarder.getData(0x0);
    const data = await identityForwarder.getData('a');

    assert.equal(owner, web3.utils.padLeft(accounts[0], 64));
    assert.equal(web3.utils.toUtf8(data), 'b');
  });

  it('should be able to use KeyManager contract with forwarder', async () => {
    const keyManager = await KeyManager.new();
    const Forwarder = await createForwarder(keyManager.address);
    const forwarder = await Forwarder.new();

    const keyManagerForwarder = await KeyManager.at(forwarder.address);
    await keyManagerForwarder.initialise();
    await reverting(keyManagerForwarder.initialise());

    await keyManagerForwarder.setKey('a', 2, 2);

    let keyData = await keyManagerForwarder.getKey(web3.utils.keccak256(accounts[0]));
    assert.equal(keyData[0].toNumber(), 1);
    assert.equal(keyData[1].toNumber(), 1);

    keyData = await keyManagerForwarder.getKey('a');
    assert.equal(keyData[0].toNumber(), 2);
    assert.equal(keyData[1].toNumber(), 2);
  });
});
