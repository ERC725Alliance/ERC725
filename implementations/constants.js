const INTERFACE_ID = {
    ERC165: '0x01ffc9a7',
    ERC725X: '0x570ef073',
    ERC725Y: '0x714df77c',
};

const OPERATION_TYPE = {
    CALL: 0,
    CREATE: 1,
    CREATE2: 2,
    STATICCALL: 3,
    DELEGATECALL: 4,
};

const FUNCTIONS_SELECTOR = {
    EXECUTE: '0x44c028fe',
    EXECUTE_ARRAY: '0x13ced88d',
    SETDATA: '0x7f23690c',
    SETDATA_ARRAY: '0x14a6e293',
};

module.exports = {
    INTERFACE_ID,
    OPERATION_TYPE,
    FUNCTIONS_SELECTOR,
};
