const ERC165InterfaceIDs = artifacts.require("ERC165InterfaceIDs");

const { INTERFACE_ID } = require("../utils/constants");

contract("Calculate Interface IDs", (accounts) => {
  let contract;

  before(async function () {
    contract = await ERC165InterfaceIDs.new();
  });

  it("ERC725X", async () => {
    const result = await contract.getERC725XInterfaceID.call();
    assert.equal(result, INTERFACE_ID.ERC725X);

    console.log("ERC725X:", result);
  });

  it("ERC725Y", async () => {
    const result = await contract.getERC725YInterfaceID.call();
    assert.equal(result, INTERFACE_ID.ERC725Y);

    console.log("ERC725Y:", result);
  });

  it("ERC725Account", async () => {
    const result = await contract.calculateERC725AccountInterfaceID.call();
    assert.equal(result, INTERFACE_ID.ERC725Account);

    console.log("ERC725Account:", result);
  });
});
