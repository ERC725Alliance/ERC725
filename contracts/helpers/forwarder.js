const fs = require('fs');
const solc = require('solc');
const { getCoinbase, compileCode } = require('./utils');
const web3 = require('web3');
const { checkAddressChecksum, toChecksumAddress } = web3.utils;

async function createForwarder(address) {
  if (!checkAddressChecksum(address)) {
    address = toChecksumAddress(address);
  }
  const solidityCode = `
  pragma solidity ^0.4.24;
  contract Forwarder {
    constructor(bytes _data) public {
      if (_data.length > 0) {
        require(address(${address}).delegatecall(_data), "Initialization failed");
      }
    }
    function() external payable {
      require(msg.sig != 0x0, "Function signature not specified");
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
  const source = { 'Forwarder': solidityCode }
  const options = {
    'contracts_directory': 'contracts',
    solc
  }
  const coinbase = await getCoinbase();
  return compileCode(source, options, coinbase);
}

module.exports = createForwarder;
