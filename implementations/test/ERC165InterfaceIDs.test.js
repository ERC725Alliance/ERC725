const ERC165InterfaceIDs = artifacts.require("ERC165InterfaceIDs");

const { INTERFACE_ID } = require("../utils/constants");

contract("Calculate Interface IDs", (accounts) => {
  let contract;

  before(async function () {
    contract = await ERC165InterfaceIDs.new();
  });

  it("ERC173:", async () => {
    const result = await contract.getERC173InterfaceID.call();
    console.log("ERC173:", result);

    assert.equal(result, INTERFACE_ID.ERC173);
  });

  it("ERC1271:", async () => {
    const result = await contract.getERC1271InterfaceID.call();
    console.log("ERC1271:", result);

    assert.equal(result, INTERFACE_ID.ERC1271);
  });

  it("ERC725X", async () => {
    const result = await contract.getERC725XInterfaceID.call();
    console.log("ERC725X:", result);

    assert.equal(result, INTERFACE_ID.ERC725X);
  });

  it("ERC725Y", async () => {
    const result = await contract.getERC725YInterfaceID.call();
    console.log("ERC725Y:", result);

    assert.equal(result, INTERFACE_ID.ERC725Y);
  });

  it("ERC725Account", async () => {
    const result = await contract.calculateERC725AccountInterfaceID.call();
    console.log("ERC725Account:", result);

    assert.equal(result, INTERFACE_ID.ERC725Account);
  });

  it("LSP1:", async () => {
    const result = await contract.getLSP1InterfaceID.call();
    console.log("LSP1:", result);

    assert.equal(result, INTERFACE_ID.LSP1);
  });

  it("LSP1Delegate:", async () => {
    const result = await contract.getLSP1DelegateInterfaceID.call();
    console.log("LSP1:", result);

    assert.equal(result, INTERFACE_ID.LSP1Delegate);
  });
});
