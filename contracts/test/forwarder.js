const {reverting} = require('../node_modules/openzeppelin-solidity/test/helpers/shouldFail');
const createForwarder = require('../helpers/forwarder');
const { getEncodedCall } = require('../helpers/utils');
const { toBN, keccak256, toUtf8 } = web3.utils;

const Identity = artifacts.require('Identity');
const KeyManager = artifacts.require('KeyManager');

contract('Forwarder', async (accounts) => {
  it('should be able to use Identity contract with forwarder', async () => {
    const identity = await Identity.new();
    const encodedData = getEncodedCall(identity, 'initialize', [accounts[0]]);
    const forwarder = await createForwarder(identity.address, encodedData);

    const identityForwarder = await Identity.at(forwarder.options.address);
    await reverting(identityForwarder.initialize(accounts[0]));

    const value = `0x${toBN(1).toString(16, 64)}`;
    await identityForwarder.setData('0x0a', value);

    const owner = await identityForwarder.getData('0x00');
    const data = await identityForwarder.getData('0x0a');

    assert.equal(owner, `0x${toBN(accounts[0], 16).toString(16, 64)}`);
    assert.equal(data, value);
  });

  it('should be able to use KeyManager contract with forwarder', async () => {
    const keyManager = await KeyManager.new();
    const encodedData = getEncodedCall(keyManager, 'initialize');
    const forwarder = await createForwarder(keyManager.address, encodedData);

    const keyManagerForwarder = await KeyManager.at(forwarder.options.address);
    await reverting(keyManagerForwarder.initialize());

    await keyManagerForwarder.setKey('0x0a', 2, 2);

    let keyData = await keyManagerForwarder.getKey(keccak256(accounts[0]));
    assert.equal(keyData[0].toNumber(), 1);
    assert.equal(keyData[1].toNumber(), 1);

    keyData = await keyManagerForwarder.getKey('0x0a');
    assert.equal(keyData[0].toNumber(), 2);
    assert.equal(keyData[1].toNumber(), 2);
  });

  it('should not be able to send transaction without function signature', async () => {
    const keyManager = await KeyManager.new();
    const encodedData = getEncodedCall(keyManager, 'initialize');
    const forwarder = await createForwarder(keyManager.address, encodedData);

    // Even if there is not check for function signature in Forwarder contract,
    // this transaction would fail because there is no payable fallback function on KeyManager contract
    // Will keep this here until we add support for revert message
    await reverting(web3.eth.sendTransaction({
      from: accounts[0],
      to: forwarder.options.address,
      value: 1
    }));
  });
});
