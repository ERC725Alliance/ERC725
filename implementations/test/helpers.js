// A version of expectRevert, that can handle custom errors
//
// Can be removed once this issue is fixed
// https://github.com/OpenZeppelin/openzeppelin-test-helpers/issues/180
async function expectRevertWithCustomError(promise, expectedError) {
    try {
        await promise;
    } catch (error) {
        // not sure what the keys are in error.data, looks like an address but its not the called
        // contract or the EOA that signed the tx.. seems there is only one entry, so we use the
        // first key to get the returned error
        const errorData = error.data[Object.keys(error.data)[0]];
        expect(errorData.return).to.equal(expectedError, 'Wrong kind of exception received');

        return;
    }

    expect.fail('Expected an exception but none was received');
}

module.exports = {
    expectRevertWithCustomError,
};
