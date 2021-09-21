const Calculate165Selectors = artifacts.require("Calculate165Selectors");

contract("Calculate Selectors", accounts => {
    let contract;
    beforeEach(async function () {
        contract = await Calculate165Selectors.new();
    });

    it("ERC725X", async () => {
        const result = await contract.calculateSelectorERC725X.call();
        console.log('ERC725X:', result);
    });
    it("ERC725Y", async () => {
        const result = await contract.calculateSelectorERC725Y.call();
        console.log('ERC725Y:', result);
    });
    it("ERC725Account", async () => {
        const result = await contract.calculateSelectorERC725Account.call();
        console.log('ERC725Account:', result);
    });
    // it("LSP1", async () => {
    //     const result = await contract.calculateSelectorLSP1.call();
    //     console.log('LSP1:', result);
    // });
    // it("ERC1271", async () => {
    //     const result = await contract.calculateSelectorERC1271.call();
    //     console.log('ERC1271:', result);
    // });
});
