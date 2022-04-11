const ERC165InterfaceIDs = artifacts.require("ERC165InterfaceIDs");

const { INTERFACE_ID } = require("../constants");

contract("Calculate Interface IDs", (accounts) => {
  let contract;

  before(async function () {
    contract = await ERC165InterfaceIDs.new();
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
});
