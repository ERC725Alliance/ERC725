const {createAccountForwarder, createInitializeForwarder} = require('../helpers/forwarder');
const { getEncodedCall, checkErrorRevert } = require('../helpers/utils');
const { keccak256 } = web3.utils;

const Account = artifacts.require('ERC725Account');
const KeyManager = artifacts.require('ERC734KeyManager');
const CounterContract = artifacts.require('Counter');

const OPERATION_CALL = 0;

let ERC725AccountIdentifier = web3.utils.keccak256('ERC725Account').substr(0, 10);
let supportStandardsKey = web3.utils.keccak256('SupportedStandards').substr(0, 34) + '0'.repeat(24) + ERC725AccountIdentifier.replace('0x','')


contract('Forwarder', async (accounts) => {
  let LibraryAccount;

  it('Create library account', async () => {
    LibraryAccount = await Account.new('0xffffffffffffffffffffffffffffffffffffffff');
  });

  it("Check for key: SupportedStandards > ERC725Account value: bytes4(keccak256('ERC725Account')):", async () => {
    assert.equal(await LibraryAccount.getData(supportStandardsKey), ERC725AccountIdentifier);
  });

  it('should be able to use Account contract with forwarder', async () => {
    const owner =  accounts[0];
    const forwarder = await createAccountForwarder(LibraryAccount.address, owner);
    const accountForwarder = await Account.at(forwarder.options.address);
    // await checkErrorRevert(accountForwarder.initialize(accounts[0]), 'contract-already-initialized');

    await accountForwarder.setData('0x0a', keccak256(accounts[1]), {from: owner});

    assert.equal(await accountForwarder.owner(), owner);
    assert.isTrue(await accountForwarder.supportsInterface('0x01ffc9a7'), 'Doenst support ERC165');
    assert.isTrue(await accountForwarder.supportsInterface('0x44c028fe'), 'Doenst support ERC725X');
    assert.isTrue(await accountForwarder.supportsInterface('0x2bd57b73'), 'Doenst support ERC725Y');
    assert.equal(await accountForwarder.getData('0x0a'), keccak256(accounts[1]));
  });

  it('should receive ether using a Account contract with forwarder', async () => {
    const owner =  accounts[0];
    const forwarder = await createAccountForwarder(LibraryAccount.address, owner);
    const accountForwarder = await Account.at(forwarder.options.address);
    let oneEth =  await web3.utils.toWei('1', 'ether');

    // Checking that balance of Identity contract is 0.
    const actualBalance = await web3.eth.getBalance(accountForwarder.address);
    assert.equal(actualBalance.toString(), '0');

    // Sending ether to the Account contract.
    await web3.eth.sendTransaction({
      from: accounts[1],
      to: accountForwarder.address,
      value: oneEth
    });

    // Check Identity contract has received the ether.
    assert.equal(oneEth, await web3.eth.getBalance(accountForwarder.address));
  });

  it('should send ether using a Account contract with forwarder', async() => {
    const owner =  accounts[0];
    const Counter = await CounterContract.new();
    const forwarder = await createAccountForwarder(LibraryAccount.address, owner);
    const accountForwarder = await Account.at(forwarder.options.address);
    let twoEth =  await web3.utils.toWei('2', 'ether');
    let oneEth =  await web3.utils.toWei('1', 'ether');
    let zeroEth =  await web3.utils.toWei('0', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[1],
      to: accountForwarder.address,
      value: oneEth
    });

    // We have 1 ether
    assert.equal(oneEth, await web3.eth.getBalance(accountForwarder.address));

    // Sending 1 ether
    await accountForwarder.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {from: accounts[0]});

    // We have 0 ether
    assert.equal(zeroEth, await web3.eth.getBalance(accountForwarder.address));

    // Sending 1 ether directly from the owner and pass on
    await accountForwarder.execute(OPERATION_CALL, Counter.address, oneEth, "0x", {
      from: accounts[0],
      value: oneEth
    });

    // We have 0 ether
    assert.equal(zeroEth, await web3.eth.getBalance(accountForwarder.address));

    // contract received 1 ether
    assert.equal(twoEth, await web3.eth.getBalance(Counter.address));
  });

  it('should be able to use KeyManager contract with forwarder', async () => {
    const keyManager = await KeyManager.new();
    const encodedData = getEncodedCall(keyManager, 'initialize');
    const forwarder = await createInitializeForwarder(keyManager.address, encodedData);

    const keyManagerForwarder = await KeyManager.at(forwarder.options.address);
    await checkErrorRevert(keyManagerForwarder.initialize(), 'contract-already-initialized');

    await keyManagerForwarder.setKey('0x0a', 2, 2);

    let keyData = await keyManagerForwarder.getKey(keccak256(accounts[0]));
    assert.equal(keyData[0].toNumber(), 1);
    assert.equal(keyData[1].toNumber(), 1);

    keyData = await keyManagerForwarder.getKey('0x0a');
    assert.equal(keyData[0].toNumber(), 2);
    assert.equal(keyData[1].toNumber(), 2);
  });

  it('should not be able to create forwarder if initialization transaction data is not passed', async () => {
    const keyManager = await KeyManager.new();
    await checkErrorRevert(createInitializeForwarder(keyManager.address, '0x00'), 'initialization-failed');
  });

  it('should not be able to send transaction without function signature', async () => {
    const keyManager = await KeyManager.new();
    const encodedData = getEncodedCall(keyManager, 'initialize');
    const forwarder = await createInitializeForwarder(keyManager.address, encodedData);

    await checkErrorRevert(web3.eth.sendTransaction({
      from: accounts[0],
      to: forwarder.options.address,
      value: 1
    }), 'function-signature-not-specified');
  });
});
