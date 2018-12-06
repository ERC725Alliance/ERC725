const fs = require('fs');
const solc = require('solc');
const truffleContract = require('truffle-contract');
const compile = require('truffle-compile');

async function getCoinbase() {
  return new Promise(function (resolve, reject) {
    web3.eth.getCoinbase(function (err, res) {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

function compileCode(source, options, coinbase) {
  return new Promise(function (resolve, reject) {
    compile(source, options, function (err, val) {
      if (err) {
        reject(err)
      }
      const Forwarder = truffleContract(val.Forwarder);
      Forwarder.setProvider(web3.currentProvider);
      Forwarder.defaults({
        from: coinbase,
        gas: 6721975
      })
      resolve(Forwarder)
    });
  });
}

async function createForwarder(address) {
  const solidityCode = `
  pragma solidity ^0.4.24;
  contract Forwarder {
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
