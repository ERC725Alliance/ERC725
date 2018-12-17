pragma solidity ^0.5.1;

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
    function() external payable {}
}
