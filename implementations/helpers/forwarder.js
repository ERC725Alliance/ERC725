const solc = require("solc");
const { getCoinbase, compileCode } = require("./utils");
const { checkAddressChecksum, toChecksumAddress } = web3.utils;

const { INTERFACE_ID } = require("../utils/constants");

/**
 * @notice the ERC725Y InterfaceID mentioned in the Solidity contract below is @deprecated and has changed
 */
async function createAccountForwarder(address, constructorData) {
  if (!checkAddressChecksum(address)) {
    address = toChecksumAddress(address);
  }
  const solidityCode = `
  pragma solidity ^0.4.24;
  contract Forwarder {

    mapping(bytes4 => bool) private _supportedInterfaces; // Overwrites slot 1 ERC165
    address private _owner; // Overwrites slot 2 ERC173
    
    constructor(address _newOwner) public {
      _owner = _newOwner;
      
      // register all interfaces
      _supportedInterfaces[${INTERFACE_ID.ERC165}] = true; // ERC165
      _supportedInterfaces[${INTERFACE_ID.ERC1271}] = true; // ERC1271
      _supportedInterfaces[${INTERFACE_ID.ERC725X}] = true; // ERC725X
      _supportedInterfaces[${INTERFACE_ID.ERC725Y}] = true; // ERC725Y
    }
    
    function() external payable {
      assembly {
        let ptr := mload(0x40)
      
        // (1) copy incoming call data
        calldatacopy(ptr, 0, calldatasize)
      
        // (2) forward call to logic contract
        let result := delegatecall(gas, ${address}, ptr, calldatasize, 0, 0)
        let size := returndatasize
      
        // (3) retrieve return data
        returndatacopy(ptr, 0, size)
      
        // (4) forward return data back to caller
        switch result
        case 0 { revert(ptr, size) }
        default { return(ptr, size) }
      }
    }
  }
  `;
  const coinbase = await getCoinbase();
  const data = solc.compile(solidityCode, 1).contracts[":Forwarder"];
  const contract = new web3.eth.Contract(JSON.parse(data.interface));
  return contract
    .deploy({
      data: data.bytecode,
      arguments: [constructorData],
    })
    .send({
      gas: 6721975,
      from: coinbase,
    });
}

async function createInitializeForwarder(address, constructorData) {
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
        let ptr := mload(0x40)
      
        // (1) copy incoming call data
        calldatacopy(ptr, 0, calldatasize)
      
        // (2) forward call to logic contract
        let result := delegatecall(gas, ${address}, ptr, calldatasize, 0, 0)
        let size := returndatasize
      
        // (3) retrieve return data
        returndatacopy(ptr, 0, size)
      
        // (4) forward return data back to caller
        switch result
        case 0 { revert(ptr, size) }
        default { return(ptr, size) }
      }
    }
  }
  `;
  const coinbase = await getCoinbase();
  const data = solc.compile(solidityCode, 1).contracts[":Forwarder"];
  const contract = new web3.eth.Contract(JSON.parse(data.interface));
  return contract
    .deploy({
      data: data.bytecode,
      arguments: [constructorData],
    })
    .send({
      gas: 6721975,
      from: coinbase,
    });
}

module.exports = {
  createAccountForwarder,
  createInitializeForwarder,
};
