let ERC725Account = artifacts.require("ERC725Account");
let ERC725AccountInit = artifacts.require("ERC725AccountInit");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ERC725Account, accounts[0]);
  deployer.deploy(ERC725AccountInit);
};
