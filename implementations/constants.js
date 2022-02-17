const INTERFACE_ID = {
    ERC165: '0x01ffc9a7',
    ERC725X: '0x44c028fe',
    ERC725Y: '0x5a988c0f',
};

const OPERATION_TYPE = {
    CALL: 0,
    CREATE: 1,
    CREATE2: 2,
    STATICCALL: 3,
    DELEGATECALL: 4,
};

module.exports = {
    INTERFACE_ID,
    OPERATION_TYPE,
};
