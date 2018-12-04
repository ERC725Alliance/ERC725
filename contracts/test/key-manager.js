const {reverting} = require('../node_modules/openzeppelin-solidity/test/helpers/shouldFail');
const web3 = require('web3');
const { toBN, keccak256 } = web3.utils;

const KeyManager = artifacts.require('KeyManager');

contract("KeyManager", async (accounts) => {
  const MANAGEMENT_PURPOSE = 1;
  const EXECUTION_PURPOSE = 2;
  const EXECUTION_AND_MANAGEMENT_PURPOSE = 3;
  const ECDSA_TYPE = 1;
  let keyManager;
  beforeEach(async () => {
    keyManager = await KeyManager.new();
  });

  it('should create management key for creator', async function() {
    const key = keccak256(accounts[0]);
    const [type, purposes] = await keyManager.getKey(key);
    const hasManagementPurpose = await keyManager.keyHasPurpose(key, MANAGEMENT_PURPOSE);
    assert.equal(type.toNumber(), ECDSA_TYPE);
    assert.equal(purposes.toNumber(), MANAGEMENT_PURPOSE);
    assert.isTrue(hasManagementPurpose);
  });

  it('should be able to create new key', async () => {
    await keyManager.setKey("a", ECDSA_TYPE, EXECUTION_PURPOSE);

    const [keyType, purpose] = await keyManager.getKey("a");
    const hasExecutionPurpose = await keyManager.keyHasPurpose("a", EXECUTION_PURPOSE);
    assert.equal(keyType.toNumber(), ECDSA_TYPE);
    assert.isTrue(hasExecutionPurpose);
  });

  it('should not be able to create invalid key', async () => {
    await reverting(keyManager.setKey(0x0, ECDSA_TYPE, EXECUTION_PURPOSE));
  });

  it('should not be able to create key if caller does not have management key', async () => {
    await reverting(keyManager.setKey("a", ECDSA_TYPE, EXECUTION_PURPOSE, {
      from: accounts[1]
    }));
  });

  it('should be able to remove key', async () => {
    await keyManager.setKey("a", ECDSA_TYPE, EXECUTION_PURPOSE);

    let [keyType] = await keyManager.getKey("a");
    assert.equal(keyType.toNumber(), ECDSA_TYPE);

    await keyManager.removeKey("a");
    [keyType] = await keyManager.getKey("a");
    assert.equal(keyType.toNumber(), 0);
  });

  it('should be able to set multiple purposes to a key', async () => {
    await keyManager.setKey("a", ECDSA_TYPE, EXECUTION_AND_MANAGEMENT_PURPOSE);

    const hasExecutionPurpose = await keyManager.keyHasPurpose("a", EXECUTION_PURPOSE);
    assert.isTrue(hasExecutionPurpose);

    const hasManagementPurpose = await keyManager.keyHasPurpose("a", MANAGEMENT_PURPOSE);
    assert.isTrue(hasManagementPurpose);
  });

  it('should not be able to pass purpose of not power of 2', async () => {
    await keyManager.setKey("a", ECDSA_TYPE, EXECUTION_PURPOSE);

    await reverting(keyManager.keyHasPurpose("a", 0));
    await reverting(keyManager.keyHasPurpose("a", 3));
    await reverting(keyManager.keyHasPurpose("a", 5));
    await reverting(keyManager.keyHasPurpose("a", 6));
    await reverting(keyManager.keyHasPurpose("a", 7));
  });

  it('should be able to set purpases with extremely high values', async () => {
    const highestPurpose = toBN(2).pow(toBN(255)).toString();
    const secondHighestPurpose = toBN(2).pow(toBN(254)).toString();
    await keyManager.setKey("a", ECDSA_TYPE, highestPurpose);

    let hasPurpose = await keyManager.keyHasPurpose("a", highestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("a", secondHighestPurpose);
    assert.isFalse(hasPurpose);

    const allPurposes = toBN(2).pow(toBN(256)).subn(1);
    await keyManager.setKey("a", ECDSA_TYPE, allPurposes.toString());

    hasPurpose = await keyManager.keyHasPurpose("a", highestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("a", secondHighestPurpose);
    assert.isTrue(hasPurpose);

    hasPurpose = await keyManager.keyHasPurpose("a", 1);
    assert.isTrue(hasPurpose);
  });
});
