pragma solidity ^0.4.24;

contract Counter {
    uint count;

    constructor () public {
        count = 0;
    }

    function increment() public {
        count = count + 1;
    }

    function get() public view returns (uint) {
        return count;
    }
}
