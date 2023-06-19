// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev Contract used for testing
 */
contract ReturnTest {
    struct Boy {
        string name;
        uint256 age;
    }

    struct Girl {
        bool single;
        uint256 age;
    }

    error Bang();

    function functionThatRevertsWithErrorString(
        string memory error
    ) external pure {
        revert(error);
    }

    function functionThatRevertsWithCustomError() external pure {
        revert Bang();
    }

    function returnSomeUints(
        uint256[] memory _arr1,
        uint256[] memory _arr2
    ) public pure returns (uint256[] memory, uint256[] memory) {
        return (_arr1, _arr2);
    }

    function returnSomeStrings(
        string[] memory _s1,
        string[] memory _s2
    ) public pure returns (string[] memory, string[] memory) {
        return (_s1, _s2);
    }

    function returnSomeBytes(
        bytes[] memory _someData,
        bytes[] memory _someData1,
        bytes[] memory _someData2
    ) public pure returns (bytes[] memory, bytes[] memory, bytes[] memory) {
        return (_someData, _someData1, _someData2);
    }

    function functionThatReturnsBoysAndGirls(
        Boy[] memory _someData,
        Girl[] memory _someData1
    ) public pure returns (Boy[] memory, Girl[] memory) {
        return (_someData, _someData1);
    }
}
