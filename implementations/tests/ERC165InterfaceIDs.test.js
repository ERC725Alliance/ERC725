const ERC165InterfaceIDs = artifacts.require("ERC165InterfaceIDs");

contract("Calculate Interface IDs", (accounts) => {
  let contract;

  beforeAll(async function () {
    contract = await ERC165InterfaceIDs.new();
  });

  it("ERC725X", async () => {
    const result = await contract.getERC725XInterfaceID.call();
    console.log("ERC725X:", result);
  });

  it("ERC725Y", async () => {
    const result = await contract.getERC725YInterfaceID.call();
    console.log("ERC725Y:", result);
  });

  it("ERC725Account", async () => {
    const result = await contract.calculateERC725AccountInterfaceID.call();
    console.log("ERC725Account:", result);
  });
});
