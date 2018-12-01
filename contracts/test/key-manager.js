const web3Utils = require('web3-utils');
const {reverting} = require('../node_modules/openzeppelin-solidity/test/helpers/shouldFail');

const KeyManager = artifacts.require('KeyManager');

contract("KeyManager", async (accounts) => {
  const MANAGEMENT_PURPOSE = 1;
  const EXECUTION_PURPOSE = 2;
  const ECDSA_TYPE = 1;
  let keyManager;
  beforeEach(async () => {
    keyManager = await KeyManager.new();
  });

  it('should create management key for creator', async function() {
    const key = web3Utils.keccak256(accounts[0]);
    const type = await keyManager.getKeyType(key);
    const hasManagementPurpose = await keyManager.keyHasPurpose(key, MANAGEMENT_PURPOSE);
    assert.equal(type.toNumber(), ECDSA_TYPE);
    assert.isTrue(hasManagementPurpose);
  });

  it('should be able to create new key', async () => {
    await keyManager.addKey("a", ECDSA_TYPE);
    await keyManager.addKeyPurpose("a", EXECUTION_PURPOSE);

    const newKeyType = await keyManager.getKeyType("a");
    const hasExecutionPurpose = await keyManager.keyHasPurpose("a", EXECUTION_PURPOSE);
    assert.equal(newKeyType.toNumber(), ECDSA_TYPE);
    assert.isTrue(hasExecutionPurpose);
  });

  it('should not be able to create invalid key', async () => {
    await reverting(keyManager.addKey(0x0, ECDSA_TYPE));
  });

  it('should not be able to create key if caller does not have management key', async () => {
    await reverting(keyManager.addKey("a", ECDSA_TYPE, {
      from: accounts[1]
    }));
  });

  it('should not be able to add key purpose if caller does not have management key', async () => {
    await keyManager.addKey("a", ECDSA_TYPE);
    await reverting(keyManager.addKeyPurpose("a", EXECUTION_PURPOSE, {
      from: accounts[1]
    }));
  });

  it('should be able to remove key', async () => {
    await keyManager.addKey("a", ECDSA_TYPE);

    let newKeyType = await keyManager.getKeyType("a");
    assert.equal(newKeyType.toNumber(), ECDSA_TYPE);

    await keyManager.removeKey("a");
    newKeyType = await keyManager.getKeyType("a");
    assert.equal(newKeyType.toNumber(), 0);
  });
});
