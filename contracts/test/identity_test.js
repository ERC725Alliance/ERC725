const {reverting} = require('./helpers/shouldFail');
var Identity = artifacts.require('Identity')
var Counter = artifacts.require('Counter')
var Web3 = require('web3')

const KEY_OWNER = '0x0000000000000000000000000000000000000000000000000000000000000000'
const OPERATION_CALL = 0
const web3 = new Web3(Web3.givenProvider)

const getEncodedCall = (web3, instance, method, params = []) => {
  const contract = new web3.eth.Contract(instance.abi)
  return contract.methods[method](...params).encodeABI()
}

contract('Identity', function(accounts) {
  let identity, counter

  beforeEach(async function() {
    // Deploy contracts
    identity = await Identity.new(accounts[0])
    counter = await Counter.new()
  })

  it('should allow the owner to call execute', async function() {
    // Counter should be 0 initially
    assert.equal((await counter.get()).toString(), '0')

    // Call counter.increment from identity
    const encodedCall = getEncodedCall(web3, counter, 'increment')
    await identity.execute(OPERATION_CALL, counter.address, 0, encodedCall, { from: accounts[0] })

    // Check that increment was called
    assert.equal((await counter.get()).toString(), '1')
  })

  it('should not allow non-owner to call execute', async function() {
    // Counter should be 0 initially
    assert.equal((await counter.get()).toString(), '0')

    // Calling counter.increment from identity should fail
    const encodedCall = getEncodedCall(web3, counter, 'increment')
    await reverting(identity.execute(OPERATION_CALL, counter.address, 0, encodedCall, { from: accounts[1] }));

    // Check that increment was not called
    assert.equal((await counter.get()).toString(), '0')
  })
})
