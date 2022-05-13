const { assert } = require("chai");
const { web3 } = require("openzeppelin-test-helpers/src/setup");
const { expectRevert } = require("openzeppelin-test-helpers");

const ERC725Init = artifacts.require("ERC725Init");
const ProxyBreaker = artifacts.require("ProxyBreaker");

const { OPERATION_TYPE } = require("../constants");

contract("ERC725Init", (accounts) => {
  const owner = accounts[0];

  let erc725Init;
  let proxyBreaker;

  before(async () => {
    erc725Init = await ERC725Init.new({ from: owner });
    await erc725Init.initialize(owner);

    proxyBreaker = await ProxyBreaker.new();
  });

  // storage at slot 0 looks like this: 0x01cafecafecafecafecafecafecafecafecafecafe0001

  // 0x01 -> initiatedOwner
  //   cafecafecafecafecafecafecafecafecafecafe -> owner
  //   00 -> initializing
  //   01 -> initialised

  it("should fail when ERC725X.execute(...) try to remove initialised lock via DELEGATECALL", async () => {
    const slot = 0;

    const slot0Before = await web3.eth.getStorageAt(erc725Init.address, slot);

    let breakProxyPayload = proxyBreaker.contract.methods
      .turnOffInitialised()
      .encodeABI();

    await expectRevert(
      erc725Init.execute(
        OPERATION_TYPE.DELEGATECALL,
        proxyBreaker.address,
        0,
        breakProxyPayload
      ),
      "ERC725XInit: Operation DELEGATECALL cannot remove the initialised lock"
    );

    const slot0After = await web3.eth.getStorageAt(erc725Init.address, slot);

    // slot0 should not have changed
    assert.equal(slot0Before, slot0After);

    const ownerAfterDelegateCall = await erc725Init.owner();
    assert.equal(ownerAfterDelegateCall, owner);

    // make sure it is not possible to re-initialise after DELEGATECALL
    await expectRevert(
      erc725Init.initialize(accounts[1], { from: accounts[1] }),
      "Initializable: contract is already initialized"
    );
  });

  it("should fail when ERC725X.execute(...) try to remove initiatedOwner lock via DELEGATECALL", async () => {
    const slot = 0;

    const slot0Before = await web3.eth.getStorageAt(erc725Init.address, slot);

    let breakProxyPayload = proxyBreaker.contract.methods
      .turnOffInitiatedOwner()
      .encodeABI();

    await expectRevert(
      erc725Init.execute(
        OPERATION_TYPE.DELEGATECALL,
        proxyBreaker.address,
        0,
        breakProxyPayload
      ),
      "ERC725XInit: Operation DELEGATECALL cannot remove the initiatedOwner lock"
    );

    const slot0After = await web3.eth.getStorageAt(erc725Init.address, slot);

    // slot0 should not have changed
    assert.equal(slot0Before, slot0After);

    const ownerAfterDelegateCall = await erc725Init.owner();
    assert.equal(ownerAfterDelegateCall, owner);

    // make sure it is not possible to re-initialise after DELEGATECALL
    await expectRevert(
      erc725Init.initialize(accounts[1], { from: accounts[1] }),
      "Initializable: contract is already initialized"
    );
  });
});
