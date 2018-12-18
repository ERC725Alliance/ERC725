const { toBN, keccak256 } = web3.utils;
const { checkErrorRevert } = require('../helpers/utils');

const KeyManager = artifacts.require('KeyManager');

contract("KeyManager", async (accounts) => {
  const MANAGEMENT_PURPOSE = 1;
  const EXECUTION_PURPOSE = 2;
  const EXECUTION_AND_MANAGEMENT_PURPOSE = 3;
  const ECDSA_TYPE = 1;
  let keyManager;
  beforeEach(async () => {
    keyManager = await KeyManager.new();
    keyManager.initialize();
  });

  it('should create management key for creator', async function() {
    const key = keccak256(accounts[0]);
    const { _purposes, _keyType } = await keyManager.getKey(key);
    const hasManagementPurpose = await keyManager.keyHasPurpose(key, MANAGEMENT_PURPOSE);
    assert.equal(_keyType.toNumber(), ECDSA_TYPE);
    assert.equal(_purposes.toNumber(), MANAGEMENT_PURPOSE);
    assert.isTrue(hasManagementPurpose);
  });

  it('should be able to create new key', async () => {
    await keyManager.setKey("0x0a", EXECUTION_PURPOSE, ECDSA_TYPE);

    const { _keyType } = await keyManager.getKey("0x0a");
    const hasExecutionPurpose = await keyManager.keyHasPurpose("0x0a", EXECUTION_PURPOSE);
    assert.equal(_keyType.toNumber(), ECDSA_TYPE);
    assert.isTrue(hasExecutionPurpose);
  });

  it('should not be able to create invalid key', async () => {
    await checkErrorRevert(keyManager.setKey('0x00', EXECUTION_PURPOSE, ECDSA_TYPE), 'invalid-key');
  });

  it('should not be able to create key if caller does not have management key', async () => {
    await checkErrorRevert(keyManager.setKey("0x0a", EXECUTION_PURPOSE, ECDSA_TYPE, {
      from: accounts[1]
    }), 'sender-must-have-management-key');
  });

  it('should be able to remove key', async () => {
    await keyManager.setKey("0x0a", EXECUTION_PURPOSE, ECDSA_TYPE);

    let { _keyType } = await keyManager.getKey("0x0a");
    assert.equal(_keyType.toNumber(), ECDSA_TYPE);

    await keyManager.removeKey("0x0a");
    ({ _keyType } = await keyManager.getKey("0x0a"));
    assert.equal(_keyType.toNumber(), 0);
  });

  it('should be able to set multiple purposes to a key', async () => {
    await keyManager.setKey("0x0a", EXECUTION_AND_MANAGEMENT_PURPOSE, ECDSA_TYPE);

    const hasExecutionPurpose = await keyManager.keyHasPurpose("0x0a", EXECUTION_PURPOSE);
    assert.isTrue(hasExecutionPurpose);

    const hasManagementPurpose = await keyManager.keyHasPurpose("0x0a", MANAGEMENT_PURPOSE);
    assert.isTrue(hasManagementPurpose);
  });

  it('should not be able to pass purpose of not power of 2', async () => {
    await keyManager.setKey("0x0a", EXECUTION_PURPOSE, ECDSA_TYPE);

    await checkErrorRevert(keyManager.keyHasPurpose("0x0a", 0), 'purpose-must-be-power-of-2');
    await checkErrorRevert(keyManager.keyHasPurpose("0x0a", 3), 'purpose-must-be-power-of-2');
    await checkErrorRevert(keyManager.keyHasPurpose("0x0a", 5), 'purpose-must-be-power-of-2');
    await checkErrorRevert(keyManager.keyHasPurpose("0x0a", 6), 'purpose-must-be-power-of-2');
    await checkErrorRevert(keyManager.keyHasPurpose("0x0a", 7), 'purpose-must-be-power-of-2');
  });

  it('should be able to set purpases with extremely high values', async () => {
    const highestPurpose = toBN(2).pow(toBN(255)).toString();
    const secondHighestPurpose = toBN(2).pow(toBN(254)).toString();
    await keyManager.setKey("0x0a", highestPurpose, ECDSA_TYPE);

    let hasPurpose = await keyManager.keyHasPurpose("0x0a", highestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("0x0a", secondHighestPurpose);
    assert.isFalse(hasPurpose);

    const allPurposes = toBN(2).pow(toBN(256)).subn(1);
    await keyManager.setKey("0x0a", allPurposes.toString(), ECDSA_TYPE);

    hasPurpose = await keyManager.keyHasPurpose("0x0a", highestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("0x0a", secondHighestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("0x0a", 1);
    assert.isTrue(hasPurpose);
  });
});
