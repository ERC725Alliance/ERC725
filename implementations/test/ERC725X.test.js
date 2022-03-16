const { ethers } = require('ethers');
const { assert } = require('chai');
const { BN, expectRevert } = require('openzeppelin-test-helpers');
const { calculateCreate2 } = require('eth-create2-calculator');

const { expectRevertWithCustomError } = require('./helpers');

const AccountContract = artifacts.require('ERC725X');
const CounterContract = artifacts.require('Counter');
const ReturnTest = artifacts.require('ReturnTest');
const DelegateTest = artifacts.require('DelegateTest');

const { INTERFACE_ID, OPERATION_TYPE } = require('../constants');

contract('ERC725X', (accounts) => {
	let owner = accounts[0];

	let account;

	before(async () => {
		account = await AccountContract.new(owner, { from: owner });
	});

	context('Account Deployment', async () => {
		it('Deploys correctly, and compare owners', async () => {
			const accountOwner = await account.owner.call();
			assert.equal(accountOwner, owner, 'Addresses should match');
		});
	});

	context('ERC165', async () => {
		it('Supports ERC165', async () => {
			assert.isTrue(await account.supportsInterface.call(INTERFACE_ID.ERC165));
		});
		it('Supports ERC725X', async () => {
			assert.isTrue(await account.supportsInterface.call(INTERFACE_ID.ERC725X));
		});
	});

	context('Testing contract functions', async () => {
		const owner = accounts[1];
		const newOwner = accounts[2];
		const recipient = accounts[3];
		let account;

		const bytecode =
			'0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6';
		const salt = 'cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';
		const data = bytecode + salt;

		beforeEach(async () => {
			account = await AccountContract.new(owner, { from: owner });
			returnTest = await ReturnTest.new({ from: owner });
			delegateTest = await DelegateTest.new(owner, { from: owner });
			delegateTestsecond = await DelegateTest.new(owner, { from: owner });
		});

		context("Contract Ownership Standard (ERC173)", async () => {
			it('Uprade ownership correctly', async () => {
				await account.transferOwnership(newOwner, { from: owner });
				const accountOwner = await account.owner.call();
	
				assert.equal(accountOwner, newOwner, 'Addresses should match');
			});
	
			it('Refuse upgrades from non-onwer', async () => {
				await expectRevert(
					account.transferOwnership(newOwner, { from: newOwner }),
					'Ownable: caller is not the owner',
				);
			});
		});

		context("CALL", async () => {

			it('should pass if caller is the owner', async () => {
				let initialValue, abi, secondValue;
				counter = await CounterContract.new();
	
				initialValue = await counter.get();
				abi = counter.contract.methods.increment().encodeABI();
	
				await account.execute(OPERATION_TYPE.CALL, counter.address, 0, abi, {
					from: owner,
				});
				secondValue = await counter.get();
				assert.isTrue(new BN(initialValue).add(new BN(1)).eq(new BN(secondValue)));
			});

			it.todo("should fail if caller is not the owner", async () => {
				/** @todo */
			})

			// when calling a function on a contract that changes the state of the contract called

			// when calling a function in a contract that reverts
			it('Should revert with a error string while executing a call on a revertable function', async () => {
				abi = returnTest.contract.methods
					.functionThatRevertsWithErrorString('Yamen')
					.encodeABI();
	
				await expectRevert(
					account.execute(OPERATION_TYPE.CALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					'Yamen',
				);
			});
	
			it('Should revert with a custom error while executing a call on a revertable function', async () => {
				abi = returnTest.contract.methods.functionThatRevertsWithCustomError().encodeABI();
	
				const expectedError = ethers.utils
					.keccak256(ethers.utils.toUtf8Bytes('Bang()'))
					.slice(0, 10);
	
				await expectRevertWithCustomError(
					account.execute(OPERATION_TYPE.CALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					expectedError,
				);
			});

			// when calling a function in a contract that returns
			it('Should return data when executing calls', async () => {
				let names1 = ['Yamen', 'Jean', 'Fabian'];
				let names2 = ['Yamen'];
	
				abi = returnTest.contract.methods.returnSomeStrings(names1, names2).encodeABI();
	
				result = await account.execute.call(OPERATION_TYPE.CALL, returnTest.address, 0, abi, {
					from: owner,
				});
	
				let Result = web3.eth.abi.decodeParameters(['string[]', 'string[]'], result);
				assert.deepEqual(Result[0], names1);
				assert.deepEqual(Result[1], names2);
			});
	
			/** @todo */
			it.skip('Should return an array of struct {Girl} and {Boy} (decoded)', async () => {
				let boys = [{ name: 'Yamen', age: 19 }];
				let girls = [
					{ single: true, age: 54 },
					{ single: false, age: 22 },
				];
	
				abi = returnTest.contract.methods
					.functionThatReturnsBoysAndGirls(boys, girls)
					.encodeABI();
	
				result = await account.execute.call(OPERATION_TYPE.CALL, returnTest.address, 0, abi, {
					from: owner,
				});
	
				let Result = web3.eth.abi.decodeParameters(
					[
						{ 'Boy[]': { name: 'string', age: 'uint256' } },
						{ 'Girl[]': { single: 'bool', age: 'uint256' } },
					],
					result,
				);
	
				/** @todo find a way to decode array of structs in web3.js */
			});

		});

		context("STATICCALL", async () => {
			it('Allows owner to execute static call and return data', async () => {
				let nums1 = ['10', '22', '1'];
				let nums2 = ['3'];
	
				abi = returnTest.contract.methods.returnSomeUints(nums1, nums2).encodeABI();
	
				result = await account.execute.call(
					OPERATION_TYPE.STATICCALL,
					returnTest.address,
					0,
					abi,
					{
						from: owner,
					},
				);
	
				let Result = web3.eth.abi.decodeParameters(['uint256[]', 'uint256[]'], result);
				assert.deepEqual(Result[0], nums1);
				assert.deepEqual(Result[1], nums2);
			});

			it.todo("should fail when caller is not the owner", async () => {
				/** @todo */
			})
	
			it('Should revert while executing a staticcall on a function that modify the state', async () => {
				let abi;
				counter = await CounterContract.new();
				abi = counter.contract.methods.increment().encodeABI();
	
				await expectRevert(
					account.execute(OPERATION_TYPE.STATICCALL, counter.address, 0, abi, {
						from: owner,
					}),
					'revert',
				);
			});
	
			it('Should revert with a error string while executing a staticcall on a revertable function', async () => {
				abi = returnTest.contract.methods
					.functionThatRevertsWithErrorString('Yamen')
					.encodeABI();
	
				await expectRevert(
					account.execute(OPERATION_TYPE.STATICCALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					'Yamen',
				);
			});
	
			it('Should revert with a custom error while executing a staticcall on a revertable function', async () => {
				abi = returnTest.contract.methods.functionThatRevertsWithCustomError().encodeABI();
	
				const expectedError = ethers.utils
					.keccak256(ethers.utils.toUtf8Bytes('Bang()'))
					.slice(0, 10);
	
				await expectRevertWithCustomError(
					account.execute(OPERATION_TYPE.STATICCALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					expectedError,
				);
			});
		});

		context("DELEGATECALL", async () => {
			it('Allows owner to execute delegatecall', async () => {
				let abi, Value, Number;
				Number = 3;
				abi = delegateTestsecond.contract.methods.countChange(Number).encodeABI();
	
				await delegateTest.execute(
					OPERATION_TYPE.DELEGATECALL,
					delegateTestsecond.address,
					0,
					abi,
					{
						from: owner,
					},
				);
	
				Value = await delegateTest.count();
				assert(Value.toNumber() == Number);
			});

			it.todo("should fail when caller is not the owner", async () => {
				/** @todo */
			})
	
			it('Should revert with a error string while executing a delegatecall on a revertable function', async () => {
				abi = returnTest.contract.methods
					.functionThatRevertsWithErrorString('Yamen')
					.encodeABI();
	
				await expectRevert(
					account.execute(OPERATION_TYPE.DELEGATECALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					'Yamen',
				);
			});
	
			it('Should revert with a custom error while executing a delegatecall on a revertable function', async () => {
				abi = returnTest.contract.methods.functionThatRevertsWithCustomError().encodeABI();
	
				const expectedError = ethers.utils
					.keccak256(ethers.utils.toUtf8Bytes('Bang()'))
					.slice(0, 10);
	
				await expectRevertWithCustomError(
					account.execute(OPERATION_TYPE.DELEGATECALL, returnTest.address, 0, abi, {
						from: owner,
					}),
					expectedError,
				);
			});
		});

		context("CREATE", async () => {
			it('should create a new contract when caller is owner', async () => {
				let receipt = await account.execute(OPERATION_TYPE.CREATE, recipient, 0, bytecode, {
					from: owner,
				});

				/** @todo test that the contract created contains the bytecode we passed */
	
				assert.equal(receipt.logs[0].event, 'ContractCreated');
				assert.equal(receipt.logs[0].args.operation, OPERATION_TYPE.CREATE);
				assert.equal(receipt.logs[0].args.value, '0');
			});

			it.todo("should revert when caller is not the owner", async () => {
				/** @todo */
			});
	
			/** @refactor */
			it('Should return the address of the contract created', async () => {
				let receipt = await account.execute.call(
					OPERATION_TYPE.CREATE,
					recipient,
					0,
					bytecode,
					{
						from: owner,
					},
				);
	
				assert(receipt != ''); // return address
			});
		});

		context("CREATE2", async () => {
			it('Allows owner to execute create2', async () => {
				let receipt = await account.execute(OPERATION_TYPE.CREATE2, owner, 0, data, {
					from: owner,
				});
				const precomputed = calculateCreate2(
					account.address,
					'0x' + salt, // deploy with added 32 bytes salt
					bytecode,
				);
				assert.equal(receipt.logs[0].event, 'ContractCreated');
				assert.equal(receipt.logs[0].args.operation, OPERATION_TYPE.CREATE2);
				assert.equal(receipt.logs[0].args.contractAddress, precomputed);
				assert.equal(receipt.logs[0].args.value, '0');
			});
	
			it('Should return contract address when using create2', async () => {
				let receipt = await account.execute.call(OPERATION_TYPE.CREATE2, owner, 0, data, {
					from: owner,
				});
				const precomputed = calculateCreate2(account.address, '0x' + salt, bytecode);
				assert(web3.utils.toChecksumAddress(receipt) == precomputed);
			});
		})
		
	});
});
