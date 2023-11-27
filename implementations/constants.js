const INTERFACE_ID = {
  ERC165: '0x01ffc9a7',
  ERC725X: '0x7545acac',
  ERC725Y: '0x629aa694',
};

const OPERATION_TYPE = {
  CALL: 0,
  CREATE: 1,
  CREATE2: 2,
  STATICCALL: 3,
  DELEGATECALL: 4,
};

const Errors = {
  ERC725X: {
    '0x0df9a8f8': {
      error: 'ERC725X_InsufficientBalance(uint256,uint256)',
      message: 'ERC725X: Sending more balance than available in the contract',
    },
    '0x7583b3bc': {
      error: 'ERC725X_UnknownOperationType(uint256)',
      message: 'ERC725X: Operation type provided is none of the default operation types available',
    },
    '0x72f2bc6a': {
      error: 'ERC725X_MsgValueDisallowedInStaticCall()',
      message: 'ERC725X: Sending value is not allowed when making a staticcall',
    },
    '0x5ac83135': {
      error: 'ERC725X_MsgValueDisallowedInDelegateCall()',
      message: 'ERC725X: Sending value is not allowed when making a delegatecall',
    },
    '0x3041824a': {
      error: 'ERC725X_CreateOperationsRequireEmptyRecipientAddress()()',
      message: 'ERC725X: The `to` address needs to be address(0) when deploying contracts',
    },
    '0x0b07489b': {
      error: 'ERC725X_ContractDeploymentFailed()',
      message: 'ERC725X: Contract deployment failed',
    },
    '0xb81cd8d9': {
      error: 'ERC725X_NoContractBytecodeProvided()',
      message: 'ERC725X: Contract deployment requires bytecode to be provided as data',
    },
    '0x3ff55f4d': {
      error: 'ERC725X_ExecuteParametersLengthMismatch()',
      message: 'ERC725X: Parameters length mismatch in execute batch',
    },
    '0xe9ad2b5f': {
      error: 'ERC725X_ExecuteParametersEmptyArray()',
      message: 'ERC725X: Parameters cannot be an empty array',
    },
  },
  ERC725Y: {
    '0x3bcc8979': {
      error: 'ERC725Y_DataKeysValuesLengthMismatch()',
      message: 'ERC725Y: Parameters length mismatch in setData batch',
    },
    '0x97da5f95': {
      error: 'ERC725Y_DataKeysValuesEmptyArray()',
      message: 'ERC725Y: Parameters cannot be an empty array',
    },
    '0xf36ba737': {
      error: 'ERC725Y_MsgValueDisallowed()',
      message: 'ERC725Y: Sending value to setData functions is not allowed',
    },
  },
};

const EventSignatures = {
  ERC725X: {
    /**
     * event ContractCreated(
     *     uint256 indexed _operation,
     *     address indexed _contractAddress,
     *     uint256 _value
     *     bytes32 indexed _salt
     * );
     *
     * signature = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    ContractCreated: '0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3',
    /**
     * event Executed(
     *      uint256 indexed _operation,
     *      address indexed _to,
     *      uint256 _value,
     *      bytes4 indexed _selector
     * );
     *
     * signature = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    Executed: '0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e',
  },
  ERC725Y: {
    /**
     * event DataChanged(
     * 		bytes32 indexed dataKey,
     * 		bytes dataValue
     * );
     *
     * signature = keccak256('DataChanged(bytes32,bytes)')
     */
    DataChanged: '0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2',
  },
};

module.exports = {
  INTERFACE_ID,
  OPERATION_TYPE,
  Errors,
  EventSignatures,
};
