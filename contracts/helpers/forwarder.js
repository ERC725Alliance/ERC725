const solc = require('solc');
const { getCoinbase, compileCode } = require('./utils');
const { checkAddressChecksum, toChecksumAddress } = web3.utils;

async function createForwarder(address, constructorData) {
  if (!checkAddressChecksum(address)) {
    address = toChecksumAddress(address);
  }
  const solidityCode = `
  pragma solidity ^0.4.24;
  contract Forwarder {
    constructor(bytes _data) public {
      require(_data.length > 0, "Transaction data not passed");
      require(address(${address}).delegatecall(_data), "initialization-failed");
    }
    function() external payable {
      require(msg.sig != 0x0, "function-signature-not-specified");
      assembly {
        calldatacopy(mload(0x40), 0, calldatasize)
        let result := delegatecall(gas, ${address}, mload(0x40), calldatasize, mload(0x40), 0)
        returndatacopy(mload(0x40), 0, returndatasize)
        switch result
        case 1 { return(mload(0x40), returndatasize) }
        default { revert(mload(0x40), returndatasize) }
      }
    }
  }
  `;
  const coinbase = await getCoinbase();
  const data = solc.compile(solidityCode, 1).contracts[':Forwarder'];
  const contract = new web3.eth.Contract(JSON.parse(data.interface));
  return contract.deploy({
    data: data.bytecode,
    arguments: [constructorData]
  })
  .send({
    gas: 6721975,
    from: coinbase
  });
}

module.exports = createForwarder;
