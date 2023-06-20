import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber } from 'ethers';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AddressZero } from '@ethersproject/constants';
import type { TransactionResponse } from '@ethersproject/abstract-provider';

// types
import {
  ERC725X,
  ReceiveTester__factory,
  RevertTester__factory,
  NoReceive__factory,
  NonPayableFallbackContract__factory,
  PayableFallbackContract__factory,
  Counter,
  ReturnTest,
  Counter__factory,
  SelfDestruct,
  ReturnTest__factory,
  SelfDestruct__factory,
} from '../types';

// bytecode for CREATE Operations
import {
  bytecode as WithConstructorWithArgsContractBytecode,
  deployedBytecode as WithConstructorWithArgsContractDeployedBytecode,
} from '../artifacts/contracts/helpers/WithConstructorWithArgs.sol/WithConstructorWithArgs.json';

import {
  bytecode as WithConstructorWithoutArgsContractBytecode,
  deployedBytecode as WithConstructorWithoutArgsContractDeployedBytecode,
} from '../artifacts/contracts/helpers/WithConstructorWithoutArgs.sol/WithConstructorWithoutArgs.json';

import {
  bytecode as WithConstructorPayableContractBytecode,
  deployedBytecode as WithConstructorPayableContractDeployedBytecode,
} from '../artifacts/contracts/helpers/WithConstructorPayable.sol/WithConstructorPayable.json';

import {
  bytecode as WithoutConstructorContractBytecode,
  deployedBytecode as WithoutConstructorContractDeployedBytecode,
} from '../artifacts/contracts/helpers/WithoutConstructor.sol/WithoutConstructor.json';

import {
  bytecode as DestructableContractBytecode,
  deployedBytecode as DestructableContractDeployedBytecode,
} from '../artifacts/contracts/helpers/selfdestruct.sol/SelfDestruct.json';

// abi

import { abi as DestructableContractABI } from '../artifacts/contracts/helpers/selfdestruct.sol/SelfDestruct.json';

// constants
import { INTERFACE_ID, OPERATION_TYPE } from '../constants';

export type ERC725XTestAccounts = {
  owner: SignerWithAddress;
  caller: SignerWithAddress;
  creator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<ERC725XTestAccounts> => {
  const [owner, caller, creator, anyone] = await ethers.getSigners();
  return {
    owner,
    caller,
    creator,
    anyone,
  };
};

export type ERC725XDeployParams = {
  newOwner: string;
  funding?: BigNumber;
};

export type ERC725XTestContext = {
  accounts: ERC725XTestAccounts;
  erc725X: ERC725X;
  deployParams: ERC725XDeployParams;
};

export const shouldBehaveLikeERC725X = (buildContext: () => Promise<ERC725XTestContext>) => {
  let context: ERC725XTestContext;
  let provider;
  let valueToSend;
  let abiCoder;

  beforeEach(async () => {
    context = await buildContext();
    provider = ethers.provider;
    abiCoder = new ethers.utils.AbiCoder();

    // fund erc725X contract
    valueToSend = ethers.utils.parseEther('50');
    await context.erc725X
      .connect(context.accounts.owner)
      .execute(OPERATION_TYPE.CALL, AddressZero, 0, '0x', {
        value: valueToSend,
      });
  });

  describe('When testing ownership', () => {
    describe('When owner is transferring ownership', () => {
      it('should pass and emit OwnershipTransferred event ', async () => {
        await expect(
          context.erc725X
            .connect(context.accounts.owner)
            .transferOwnership(context.accounts.anyone.address),
        )
          .to.emit(context.erc725X, 'OwnershipTransferred')
          .withArgs(context.accounts.owner.address, context.accounts.anyone.address);

        const accountOwner = await context.erc725X.callStatic.owner();

        expect(accountOwner).to.equal(context.accounts.anyone.address);
      });
    });

    describe('When non-owner is transferring ownership', () => {
      it('should revert', async () => {
        await expect(
          context.erc725X
            .connect(context.accounts.anyone)
            .transferOwnership(context.accounts.anyone.address),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('When owner is renouncing ownership', () => {
      it('should pass and emit OwnershipTransferred event', async () => {
        await expect(context.erc725X.connect(context.accounts.owner).renounceOwnership())
          .to.emit(context.erc725X, 'OwnershipTransferred')
          .withArgs(context.accounts.owner.address, AddressZero);

        const accountOwner = await context.erc725X.callStatic.owner();

        expect(accountOwner).to.equal(AddressZero);
      });
    });

    describe('When non-owner is renouncing ownership', () => {
      it('should revert', async () => {
        await expect(
          context.erc725X.connect(context.accounts.anyone).renounceOwnership(),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });
  });

  describe('When testing execution', () => {
    describe('When testing the execute function', () => {
      describe('When testing execution ownership', () => {
        describe('When owner is executing', () => {
          it('should pass and emit Executed event', async () => {
            const txParams = {
              Operation: OPERATION_TYPE.CALL,
              to: context.accounts.anyone.address,
              value: ethers.utils.parseEther('1'),
              data: '0x',
            };

            const balanceBefore = await context.accounts.anyone.getBalance();

            await expect(
              context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
            )
              .to.emit(context.erc725X, 'Executed')
              .withArgs(
                txParams.Operation,
                txParams.to,
                txParams.value,
                '0x00000000', // no function selector
              );

            const balanceAfter = await context.accounts.anyone.getBalance();

            expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
          });
        });
        describe('When non-owner is executing', () => {
          it('should revert', async () => {
            const txParams = {
              Operation: OPERATION_TYPE.CALL,
              to: context.accounts.anyone.address,
              value: ethers.utils.parseEther('1'),
              data: '0x',
            };

            await expect(
              context.erc725X
                .connect(context.accounts.anyone)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
            ).to.be.revertedWith('Ownable: caller is not the owner');
          });
        });
      });

      describe('When testing Operation CALL', () => {
        describe('When sending native token', () => {
          describe('to a smart contract implementing receive()', () => {
            let receiveTester;
            before(async () => {
              // Helper contract implementing receive() function
              receiveTester = await new ReceiveTester__factory(context.accounts.anyone).deploy();
            });

            it('should pass', async () => {
              const balanceBefore = await provider.getBalance(receiveTester.address);

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: receiveTester.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              await context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const balanceAfter = await provider.getBalance(receiveTester.address);

              expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
            });
          });

          describe('to a smart contract implementing payable fallback()', () => {
            let payableFallbackContract;
            before(async () => {
              // Helper contract implementing payable fallback() function
              payableFallbackContract = await new PayableFallbackContract__factory(
                context.accounts.anyone,
              ).deploy();
            });

            it('should pass', async () => {
              const balanceBefore = await provider.getBalance(payableFallbackContract.address);

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: payableFallbackContract.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              await context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const balanceAfter = await provider.getBalance(payableFallbackContract.address);

              expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
            });
          });

          describe('to a smart contract implementing non-payable fallback()', () => {
            let nonPayableFallbackContract;
            before(async () => {
              // Helper contract implementing non-payable fallback() function
              nonPayableFallbackContract = await new NonPayableFallbackContract__factory(
                context.accounts.anyone,
              ).deploy();
            });

            it('should revert', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: nonPayableFallbackContract.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('ERC725X: Unknown Error');
            });
          });

          describe('to a smart contract not implementing receive()', () => {
            let noReceive;
            before(async () => {
              // Helper contract not implementing receive() function
              noReceive = await new NoReceive__factory(context.accounts.anyone).deploy();
            });

            it('should revert', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: noReceive.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('ERC725X: Unknown Error');
            });
          });

          describe('to a smart contract implementing receive() that reverts with custom error', () => {
            let revertTester;

            before(async () => {
              // Helper contract implementing receive() function that revert with custom error
              revertTester = await new RevertTester__factory(context.accounts.anyone).deploy();
            });

            it('should revert with custom errors', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: revertTester.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.be.revertedWithCustomError(revertTester, 'MyCustomError')
                .withArgs(context.erc725X.address, context.accounts.owner.address);
            });
          });

          describe('to an EOA without sending some bytes', () => {
            it('should pass and emit an event with bytes4(0) as data', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: context.accounts.anyone.address,
                value: ethers.utils.parseEther('1'),
                data: '0x',
              };

              const balanceBefore = await context.accounts.anyone.getBalance();

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(txParams.Operation, txParams.to, txParams.value, '0x00000000');

              const balanceAfter = await context.accounts.anyone.getBalance();

              expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
            });
          });

          describe('to an EOA with sending some bytes (more than 4 bytes)', () => {
            it('should pass and emit an event with first 4 bytes sent', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: context.accounts.anyone.address,
                value: ethers.utils.parseEther('1'),
                data: '0xaabbccddaabbccdd',
              };

              const balanceBefore = await context.accounts.anyone.getBalance();

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operation,
                  txParams.to,
                  txParams.value,
                  txParams.data.substring(0, 10),
                );

              const balanceAfter = await context.accounts.anyone.getBalance();

              expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
            });
          });

          describe('to an EOA with sending some bytes (less than 4 bytes)', () => {
            it('should emit an event with bytes padded with 0', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: context.accounts.anyone.address,
                value: ethers.utils.parseEther('1'),
                data: '0xaabb',
              };

              const balanceBefore = await context.accounts.anyone.getBalance();

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(txParams.Operation, txParams.to, txParams.value, txParams.data + '0000');
              const balanceAfter = await context.accounts.anyone.getBalance();

              expect(balanceBefore.add(txParams.value)).to.equal(balanceAfter);
            });
          });

          describe('without having enough balance', () => {
            it('should revert', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: AddressZero,
                value: ethers.utils.parseEther('75'),
                data: '0x',
              };

              const contractBalance = await provider.getBalance(context.erc725X.address);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.be.revertedWithCustomError(context.erc725X, 'ERC725X_InsufficientBalance')
                .withArgs(contractBalance, ethers.utils.parseEther('75'));
            });
          });
        });

        describe('When interacting with functions', () => {
          describe('that change the state', () => {
            let counterContract;
            before(async () => {
              // Helper contract implementing state
              counterContract = await new Counter__factory(context.accounts.anyone).deploy();
            });

            it('should pass and emit event with function selector', async () => {
              const counterBeforeIncrementing = await counterContract.callStatic.count();

              const incrementCounterABI = counterContract.interface.encodeFunctionData('increment');

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: counterContract.address,
                value: 0,
                data: incrementCounterABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operation,
                  txParams.to,
                  txParams.value,
                  txParams.data.substring(0, 10),
                );

              const counterAfterIncrementing = await counterContract.callStatic.count();

              expect(counterBeforeIncrementing.add(1)).to.equal(counterAfterIncrementing);
            });
          });

          describe('that is marked payable', () => {
            let counterContract;
            before(async () => {
              // Helper contract implementing payable function
              counterContract = await new Counter__factory(context.accounts.anyone).deploy();
            });
            it('should pass and emit event with function selector', async () => {
              const counterBeforeIncrementing = await counterContract.callStatic.count();

              const incrementWithValueCounterABI =
                counterContract.interface.encodeFunctionData('incrementWithValue');

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: counterContract.address,
                value: ethers.utils.parseEther('1'),
                data: incrementWithValueCounterABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operation,
                  txParams.to,
                  txParams.value,
                  txParams.data.substring(0, 10),
                );

              const counterAfterIncrementing = await counterContract.callStatic.count();

              expect(counterBeforeIncrementing.add(1)).to.equal(counterAfterIncrementing);
            });
          });

          describe('that is marked view', () => {
            let counterContract;
            before(async () => {
              // Helper contract implementing view function
              counterContract = await new Counter__factory(context.accounts.anyone).deploy();
            });

            it('should pass', async () => {
              const counter = await counterContract.callStatic.count();

              const countCounterABI = counterContract.interface.encodeFunctionData('count');

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: counterContract.address,
                value: 0,
                data: countCounterABI,
              };

              const returnValue = await context.erc725X.callStatic[
                'execute(uint256,address,uint256,bytes)'
              ](txParams.Operation, txParams.to, txParams.value, txParams.data);

              const [countDecoded] = abiCoder.decode(['uint256'], returnValue);

              expect(countDecoded).to.equal(counter);
            });
          });

          describe('that reverts with custom errors', () => {
            let returnTest;
            before(async () => {
              // Helper contract implementing function that reverts with custom errors
              returnTest = await new ReturnTest__factory(context.accounts.anyone).deploy();
            });

            it('should revert and bubble the error', async () => {
              const customErrorFunctionABI = returnTest.interface.encodeFunctionData(
                'functionThatRevertsWithCustomError',
              );

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: returnTest.address,
                value: 0,
                data: customErrorFunctionABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(returnTest, 'Bang');
            });
          });

          describe('that reverts with string errors', () => {
            let returnTest;
            before(async () => {
              // Helper contract implementing function that reverts with string errors
              returnTest = await new ReturnTest__factory(context.accounts.anyone).deploy();
            });

            it('should revert with string and bubble the error', async () => {
              const errorString = 'Oh! I revert';

              const stringErrorFunctionABI = returnTest.interface.encodeFunctionData(
                'functionThatRevertsWithErrorString',
                [errorString],
              );

              const txParams = {
                Operation: OPERATION_TYPE.CALL,
                to: returnTest.address,
                value: 0,
                data: stringErrorFunctionABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith(errorString);
            });
          });

          describe('that returns', () => {
            describe('arrays of strings', () => {
              let returnTest;
              before(async () => {
                // Helper contract implementing function that return
                returnTest = await new ReturnTest__factory(context.accounts.anyone).deploy();
              });

              it('should pass and return bytes and decode their values', async () => {
                const namesArrays = ['Alice', 'Bob'];
                const randomStringsArrays = ['LUKSO', 'CreativeEconomy'];

                const returnSomeStringsABI = returnTest.interface.encodeFunctionData(
                  'returnSomeStrings',
                  [namesArrays, randomStringsArrays],
                );

                const txParams = {
                  Operation: OPERATION_TYPE.CALL,
                  to: returnTest.address,
                  value: 0,
                  data: returnSomeStringsABI,
                };

                const returnValue = await context.erc725X.callStatic[
                  'execute(uint256,address,uint256,bytes)'
                ](txParams.Operation, txParams.to, txParams.value, txParams.data);

                const arrays = abiCoder.decode(['string[]', 'string[]'], returnValue);

                expect(arrays[0]).to.deep.equal(namesArrays);
                expect(arrays[1]).to.deep.equal(randomStringsArrays);
              });
            });

            // @todo check other types
          });
        });
      });

      describe('When testing Operation CREATE', () => {
        describe('When creating a contract', () => {
          describe('without passing the contract deployment code', () => {
            it('should revert', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: 0,
                data: '0x',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_NoContractBytecodeProvided',
              );
            });
          });

          describe('without constructor', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: 0,
                data: WithoutConstructorContractBytecode,
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithoutConstructorContractDeployedBytecode);
            });
          });

          describe('with constructor with arguments', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const argument = abiCoder.encode(['address'], [context.accounts.anyone.address]);

              // Bytecode + arguments
              const initCode = WithConstructorWithArgsContractBytecode + argument.substring(2);

              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: 0,
                data: initCode,
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithConstructorWithArgsContractDeployedBytecode);
            });
          });

          describe('with constructor without arguments', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: 0,
                data: WithConstructorWithoutArgsContractBytecode,
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithConstructorWithoutArgsContractDeployedBytecode);
            });
          });

          describe('with constructor with arguments but without passing them', () => {
            it('should revert and not create the contract', async () => {
              // Bytecode + the needed argument
              const initCode = WithConstructorWithArgsContractBytecode; // without the needed argument

              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: 0,
                data: initCode,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_ContractDeploymentFailed');
            });
          });

          describe('without specifying to as address(0)', () => {
            it('should revert and not create the contract', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: context.accounts.anyone.address, // should be the AddressZero when creating contract
                value: 0,
                data: WithoutConstructorContractBytecode,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_CreateOperationsRequireEmptyRecipientAddress',
              );
            });
          });

          describe('that have a payable constructor with sending value ', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: ethers.utils.parseEther('10'),
                data: WithConstructorPayableContractBytecode,
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(await provider.getBalance(addressContractCreated)).to.equal(txParams.value);

              expect(codeRetreived).to.equal(WithConstructorPayableContractDeployedBytecode);
            });
          });

          describe('that have a payable constructor with sending value more than balance ', () => {
            it('should revert and not create the contract', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: ethers.utils.parseEther('90'),
                data: WithConstructorPayableContractBytecode,
              };

              const contractBalance = await provider.getBalance(context.erc725X.address);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.be.revertedWithCustomError(context.erc725X, 'ERC725X_InsufficientBalance')
                .withArgs(contractBalance, ethers.utils.parseEther('90'));
            });
          });

          describe("that doesn't have a payable constructor with sending value ", () => {
            it('should revert and not create the contract', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.CREATE,
                to: AddressZero,
                value: ethers.utils.parseEther('10'),
                data: WithConstructorWithoutArgsContractBytecode,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_ContractDeploymentFailed');
            });
          });
        });
      });

      describe('When testing Operation CREATE2', () => {
        describe('When creating a contract', () => {
          describe('without constructor', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: WithoutConstructorContractBytecode + salt.substring(2),
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  salt,
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithoutConstructorContractDeployedBytecode);
            });
          });

          describe('with constructor with arguments', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const argument = abiCoder.encode(['address'], [context.accounts.anyone.address]);

              // Bytecode + arguments
              const initCode =
                WithConstructorWithArgsContractBytecode + argument.substring(2) + salt.substring(2);

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: initCode,
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  salt,
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithConstructorWithArgsContractDeployedBytecode);
            });
          });

          describe('with constructor without arguments', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: WithConstructorWithoutArgsContractBytecode + salt.substring(2),
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  salt,
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithConstructorWithoutArgsContractDeployedBytecode);
            });
          });

          describe('with constructor with arguments but without passing them', () => {
            it('should revert and not create the contract', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');
              // Bytecode + the needed argument
              const initCode = WithConstructorWithArgsContractBytecode + salt.substring(2); // without the needed argument

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: initCode,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('Create2: Failed on deploy');
            });
          });

          describe('with constructor with arguments but without passing the salt', () => {
            it('should revert and not create the contract', async () => {
              const argument = abiCoder.encode(['address'], [context.accounts.anyone.address]);

              // Bytecode + arguments
              const initCode = WithConstructorWithArgsContractBytecode + argument.substring(2);

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: initCode,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('Create2: Failed on deploy');
            });
          });

          describe('without specifying to as address(0)', () => {
            it('should revert and not create the contract', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: context.accounts.anyone.address, // should be the AddressZero when creating contract
                value: 0,
                data: WithoutConstructorContractBytecode + salt.substring(2),
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_CreateOperationsRequireEmptyRecipientAddress',
              );
            });
          });

          describe('that have a payable constructor with sending value ', () => {
            it('should create the contract and emit ContractCreated event', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: ethers.utils.parseEther('10'),
                data: WithConstructorPayableContractBytecode + salt.substring(2),
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  salt,
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(await provider.getBalance(addressContractCreated)).to.equal(txParams.value);

              expect(codeRetreived).to.equal(WithConstructorPayableContractDeployedBytecode);
            });
          });

          describe('that have a payable constructor with sending value more than balance ', () => {
            it('should revert and not create the contract', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: ethers.utils.parseEther('90'),
                data: WithConstructorPayableContractBytecode + salt.substring(2),
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('Create2: insufficient balance');
            });
          });

          describe("that doesn't have a payable constructor with sending value ", () => {
            it('should revert and not create the contract', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: ethers.utils.parseEther('10'),
                data: WithConstructorWithoutArgsContractBytecode + salt.substring(2),
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('Create2: Failed on deploy');
            });
          });

          describe('with the same bytecode and salt ', () => {
            it('should create the contract first time and revert on the second try', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');

              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: WithConstructorWithoutArgsContractBytecode + salt.substring(2),
              };

              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const addressContractCreatedChecksumed =
                ethers.utils.getAddress(addressContractCreated);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operation,
                  addressContractCreatedChecksumed,
                  txParams.value,
                  salt,
                );

              const codeRetreived = await provider.getCode(addressContractCreated);

              expect(codeRetreived).to.equal(WithConstructorWithoutArgsContractDeployedBytecode);

              // Second try with same parameters
              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('Create2: Failed on deploy');
            });
          });

          describe('and destructing it and re-create it at the same address', () => {
            it('should pass', async () => {
              const salt = ethers.utils.formatBytes32String('LUKSO');
              const txParams = {
                Operation: OPERATION_TYPE.CREATE2,
                to: AddressZero,
                value: 0,
                data: DestructableContractBytecode + salt.substring(2),
              };
              const addressContractCreated = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);
              await context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data);
              const destructableContract = await new ethers.Contract(
                addressContractCreated,
                DestructableContractABI,
              );
              const codeRetreivedBeforeDestructing = await provider.getCode(addressContractCreated);
              expect(codeRetreivedBeforeDestructing).to.equal(DestructableContractDeployedBytecode);
              await destructableContract.connect(context.accounts.anyone).destroyMe();
              const codeRetreivedAfterDestructing = await provider.getCode(addressContractCreated);
              expect(codeRetreivedAfterDestructing).to.equal('0x');
              // re-creating
              await context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data);
              const codeRetreivedAfterReCreating = await provider.getCode(addressContractCreated);
              expect(codeRetreivedAfterReCreating).to.equal(codeRetreivedBeforeDestructing);
              expect(codeRetreivedAfterReCreating).to.equal(DestructableContractDeployedBytecode);
            });
          });
        });
      });

      describe('When testing Operation STATICCALL', () => {
        describe('When interacting with a EOA', () => {
          describe('When sendng some bytes', () => {
            it('should pass and emit an event with data sent', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: context.accounts.anyone.address,
                value: 0,
                data: '0xaabbccdd',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operation,
                  txParams.to,
                  txParams.value,
                  txParams.data.substring(0, 10),
                );
            });
          });
          describe('When sendng value', () => {
            it('should revert ', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: context.accounts.anyone.address,
                value: ethers.utils.parseEther('10'),
                data: '0xaabbccdd',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_MsgValueDisallowedInStaticCall',
              );
            });
          });
        });
        describe('When interacting with a function', () => {
          describe('that change state', () => {
            let counterContract;
            before(async () => {
              // Helper contract implementing state
              counterContract = await new Counter__factory(context.accounts.anyone).deploy();
            });

            it('should revert', async () => {
              const incrementCounterABI = counterContract.interface.encodeFunctionData('increment');

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: counterContract.address,
                value: 0,
                data: incrementCounterABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('ERC725X: Unknown Error');
            });
          });

          describe('marked as view', () => {
            let counterContract;
            before(async () => {
              // Helper contract implementing view function
              counterContract = await new Counter__factory(context.accounts.anyone).deploy();
            });

            it('should pass', async () => {
              const getValue = await counterContract
                .connect(context.accounts.anyone)
                .callStatic.get();

              const getABI = counterContract.interface.encodeFunctionData('get');

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: counterContract.address,
                value: 0,
                data: getABI,
              };

              const result = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              expect(result).to.equal(getValue);
            });
          });

          describe('that reverts with a custom error', () => {
            let revertTester;
            before(async () => {
              // Helper contract implementing function that reverts with custom errors
              revertTester = await new RevertTester__factory(context.accounts.anyone).deploy();
            });
            it('should revert', async () => {
              const revertMeWithCustomErrorViewABI = revertTester.interface.encodeFunctionData(
                'revertMeWithCustomErrorView',
              );

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: revertTester.address,
                value: 0,
                data: revertMeWithCustomErrorViewABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.be.revertedWithCustomError(revertTester, 'MyCustomError')
                .withArgs(context.erc725X.address, context.accounts.owner.address);
            });
          });
          describe('that reverts with a string error', () => {
            let revertTester;
            before(async () => {
              // Helper contract implementing function that reverts with string errors
              revertTester = await new RevertTester__factory(context.accounts.anyone).deploy();
            });

            it('should revert', async () => {
              const revertMeWithStringViewABI =
                revertTester.interface.encodeFunctionData('revertMeWithStringView');

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: revertTester.address,
                value: 0,
                data: revertMeWithStringViewABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('I reverted');
            });
          });
        });
      });

      describe('When testing Operation DELEGATECALL', () => {
        describe('When interacting with a EOA', () => {
          describe('When sendng value', () => {
            it('should revert ', async () => {
              const txParams = {
                Operation: OPERATION_TYPE.DELEGATECALL,
                to: context.accounts.anyone.address,
                value: ethers.utils.parseEther('10'),
                data: '0xaabbccdd',
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_MsgValueDisallowedInDelegateCall',
              );
            });
          });
        });
        describe('When interacting with a function', () => {
          describe('that reverts with a custom error', () => {
            let revertTester;
            before(async () => {
              // Helper contract implementing function that reverts with custom errors
              revertTester = await new RevertTester__factory(context.accounts.anyone).deploy();
            });
            it('should revert', async () => {
              const revertMeWithCustomErrorNotViewABI = revertTester.interface.encodeFunctionData(
                'revertMeWithCustomErrorNotView',
              );

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: revertTester.address,
                value: 0,
                data: revertMeWithCustomErrorNotViewABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              )
                .to.be.revertedWithCustomError(revertTester, 'MyCustomError')
                .withArgs(context.erc725X.address, context.accounts.owner.address);
            });
          });
          describe('that reverts with a string error', () => {
            let revertTester;
            before(async () => {
              // Helper contract implementing function that reverts with string errors
              revertTester = await new RevertTester__factory(context.accounts.anyone).deploy();
            });

            it('should revert', async () => {
              const revertMeWithStringErrorNotViewABI = revertTester.interface.encodeFunctionData(
                'revertMeWithStringErrorNotView',
              );

              const txParams = {
                Operation: OPERATION_TYPE.STATICCALL,
                to: revertTester.address,
                value: 0,
                data: revertMeWithStringErrorNotViewABI,
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
              ).to.be.revertedWith('I reverted');
            });
          });
          describe('that include selfdestruct', () => {
            let destructableContract;
            before(async () => {
              destructableContract = await new SelfDestruct__factory(
                context.accounts.anyone,
              ).deploy();
            });

            it('should destroy the erc725X contract', async () => {
              const destroyFunctionABI =
                destructableContract.interface.encodeFunctionData('destroyMe');

              const txParams = {
                Operation: OPERATION_TYPE.DELEGATECALL,
                to: destructableContract.address,
                value: 0,
                data: destroyFunctionABI,
              };

              await context.erc725X
                .connect(context.accounts.owner)
                .execute(txParams.Operation, txParams.to, txParams.value, txParams.data);

              const codeRetreived = await provider.getCode(context.erc725X.address);

              expect(codeRetreived).to.equal('0x');
            });
          });
        });
      });

      describe('When providing wrong operation type', () => {
        it('should revert', async () => {
          const txParams = {
            Operation: 5,
            to: context.accounts.anyone.address,
            value: 0,
            data: '0x',
          };

          await expect(
            context.erc725X
              .connect(context.accounts.owner)
              .execute(txParams.Operation, txParams.to, txParams.value, txParams.data),
          ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_UnknownOperationType');
        });
      });
    });

    describe('When testing the execute array function', () => {
      it('should revert with error `ERC725X_ExecuteParametersEmptyArray` if all the array parameters are empty arrays [] [] [] []', async () => {
        const txParams = {
          operations: [],
          targets: [],
          values: [],
          datas: [],
        };

        await expect(
          context.erc725X
            .connect(context.accounts.owner)
            .executeBatch(txParams.operations, txParams.targets, txParams.values, txParams.datas),
        ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_ExecuteParametersEmptyArray');
      });

      it('should revert with error `ERC725X_ExecuteParametersLengthMismatch` if at least one of the array parameter is an empty array []', async () => {
        const txParams = {
          operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
          targets: [context.accounts.anyone.address, context.accounts.anyone.address],
          values: [],
          datas: ['0xcafecafe', '0xf00df00d'],
        };

        await expect(
          context.erc725X
            .connect(context.accounts.owner)
            .executeBatch(txParams.operations, txParams.targets, txParams.values, txParams.datas),
        ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_ExecuteParametersLengthMismatch');
      });

      describe('When testing execution ownership', () => {
        it('should revert if all the array parameters are empty arrays [] [] [] []', async () => {
          const txParams = {
            operations: [],
            targets: [],
            values: [],
            datas: [],
          };

          await expect(
            context.erc725X
              .connect(context.accounts.owner)
              .executeBatch(txParams.operations, txParams.targets, txParams.values, txParams.datas),
          ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_ExecuteParametersEmptyArray');
        });

        it('should revert with error `ERC725X_ExecuteParametersLengthMismatch` if at least one of the array parameter is an empty array []', async () => {
          const txParams = {
            operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
            targets: [context.accounts.anyone.address, context.accounts.anyone.address],
            values: [],
            datas: ['0xcafecafe', '0xf00df00d'],
          };

          await expect(
            context.erc725X
              .connect(context.accounts.owner)
              .executeBatch(txParams.operations, txParams.targets, txParams.values, txParams.datas),
          ).to.be.revertedWithCustomError(
            context.erc725X,
            'ERC725X_ExecuteParametersLengthMismatch',
          );
        });

        describe('When owner is executing', () => {
          it('should pass and emit Executed event', async () => {
            const txParams = {
              Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
              to: [context.accounts.anyone.address, context.accounts.anyone.address],
              values: [ethers.utils.parseEther('1'), ethers.utils.parseEther('1')],
              data: ['0x', '0x'],
            };

            const balanceBefore = await context.accounts.anyone.getBalance();

            await expect(
              context.erc725X
                .connect(context.accounts.owner)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
            )
              .to.emit(context.erc725X, 'Executed')
              .withArgs(
                txParams.Operations[0],
                txParams.to[0],
                txParams.values[0],
                '0x00000000', // no function selector
              )
              .to.emit(context.erc725X, 'Executed')
              .withArgs(
                txParams.Operations[1],
                txParams.to[1],
                txParams.values[1],
                '0x00000000', // no function selector
              );

            const balanceAfter = await context.accounts.anyone.getBalance();

            expect(balanceBefore.add(txParams.values[0]).add(txParams.values[1])).to.equal(
              balanceAfter,
            );
          });
        });

        describe('When non-owner is executing', () => {
          it('should revert', async () => {
            const txParams = {
              Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
              to: [context.accounts.anyone.address, context.accounts.anyone.address],
              values: [ethers.utils.parseEther('1'), ethers.utils.parseEther('1')],
              data: ['0x', '0x'],
            };

            await expect(
              context.erc725X
                .connect(context.accounts.anyone)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
            ).to.be.revertedWith('Ownable: caller is not the owner');
          });
        });
      });

      describe('When testing combining operations', () => {
        let targetContract: Counter;
        let contractThatReverts: ReturnTest;
        let selfdestructContract: SelfDestruct;

        before(async () => {
          const [deployer] = await ethers.getSigners();
          targetContract = await new Counter__factory(deployer).deploy();
          contractThatReverts = await new ReturnTest__factory(deployer).deploy();
          selfdestructContract = await new SelfDestruct__factory(deployer).deploy();
        });

        describe('When combining 2 CALL Operations', () => {
          describe('When both pass', () => {
            it('should pass and emit 2 Executed Event', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [targetContract.address, targetContract.address],
                values: [0, 0],
                data: [
                  targetContract.interface.encodeFunctionData('increment'),
                  targetContract.interface.encodeFunctionData('get'),
                ],
              };

              const countBefore = await targetContract.callStatic.count();

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operations[0],
                  txParams.to[0],
                  txParams.values[0],
                  txParams.data[0].substr(0, 10),
                )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operations[1],
                  txParams.to[1],
                  txParams.values[1],
                  txParams.data[1].substr(0, 10),
                );

              const countAfter = await targetContract.callStatic.count();
              expect(countBefore.add(1)).to.equal(countAfter);
            });
            it('should return array of bytes as return values', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [targetContract.address, targetContract.address],
                values: [0, 0],
                data: [
                  targetContract.interface.encodeFunctionData('increment'),
                  targetContract.interface.encodeFunctionData('get'),
                ],
              };

              const countBefore = await targetContract.callStatic.count();

              const result = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.executeBatch(
                  txParams.Operations,
                  txParams.to,
                  txParams.values,
                  txParams.data,
                );

              expect(result).to.eql([
                '0x',
                ethers.utils.hexZeroPad(ethers.utils.hexlify(countBefore.add(1)), 32),
              ]);
            });
          });

          describe('When one call revert', () => {
            it('should revert with the reason of the call that reverts', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [targetContract.address, contractThatReverts.address],
                values: [0, 0],
                data: [
                  targetContract.interface.encodeFunctionData('increment'),
                  contractThatReverts.interface.encodeFunctionData(
                    'functionThatRevertsWithErrorString',
                    ['Revert please'],
                  ),
                ],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWith('Revert please');
            });
          });

          describe('When both revert', () => {
            it('should revert with the first revert reason', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [contractThatReverts.address, contractThatReverts.address],
                values: [0, 0],
                data: [
                  contractThatReverts.interface.encodeFunctionData(
                    'functionThatRevertsWithErrorString',
                    ['Revert with one'],
                  ),
                  contractThatReverts.interface.encodeFunctionData(
                    'functionThatRevertsWithErrorString',
                    ['Revert with two'],
                  ),
                ],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWith('Revert with one');
            });
          });
        });

        describe('When combining CALL and CREATE Operations', () => {
          describe('When both pass', () => {
            it('should pass and emit 1 Executed and 1 ContractCreated Event', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CREATE],
                to: [targetContract.address, ethers.constants.AddressZero],
                values: [0, 0],
                data: [
                  targetContract.interface.encodeFunctionData('increment'),
                  WithoutConstructorContractBytecode,
                ],
              };

              const countBefore = await targetContract.callStatic.count();

              const result = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.executeBatch(
                  txParams.Operations,
                  txParams.to,
                  txParams.values,
                  txParams.data,
                );

              const contractAddress = ethers.utils.getAddress(result[1]);

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operations[0],
                  txParams.to[0],
                  txParams.values[0],
                  txParams.data[0].substr(0, 10),
                )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operations[1],
                  contractAddress,
                  txParams.values[1],
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeOfContractCreated = await provider.getCode(contractAddress);

              expect(codeOfContractCreated).to.equal(WithoutConstructorContractDeployedBytecode);

              const countAfter = await targetContract.callStatic.count();
              expect(countBefore.add(1)).to.equal(countAfter);
            });
            it('should return array of bytes as return values and contractCreated', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CREATE],
                to: [targetContract.address, ethers.constants.AddressZero],
                values: [0, 0],
                data: [
                  targetContract.interface.encodeFunctionData('increment'),
                  WithoutConstructorContractBytecode,
                ],
              };

              const result = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.executeBatch(
                  txParams.Operations,
                  txParams.to,
                  txParams.values,
                  txParams.data,
                );

              // real creation
              await context.erc725X
                .connect(context.accounts.owner)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data);

              const returnValueOfCall = result[0];
              expect(returnValueOfCall).to.equal('0x');

              const contractAddress = ethers.utils.getAddress(result[1]);
              const codeOfContractCreated = await provider.getCode(contractAddress);
              expect(codeOfContractCreated).to.equal(WithoutConstructorContractDeployedBytecode);
            });
          });

          describe('When one call revert', () => {
            it('should revert with the reason of the call that reverts', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CREATE],
                to: [contractThatReverts.address, ethers.constants.AddressZero],
                values: [0, 0],
                data: [
                  contractThatReverts.interface.encodeFunctionData(
                    'functionThatRevertsWithErrorString',
                    ['Revert please'],
                  ),
                  WithoutConstructorContractBytecode,
                ],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWith('Revert please');
            });
          });
        });

        describe('When combining CREATE and CREATE2 Operations', () => {
          describe('When both pass', () => {
            it('should pass and emit 2 ContractCreated Event and return array of contractCreated addresses', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CREATE, OPERATION_TYPE.CREATE],
                to: [ethers.constants.AddressZero, ethers.constants.AddressZero],
                values: [0, 0],
                data: [WithoutConstructorContractBytecode, WithoutConstructorContractBytecode],
              };

              const contractsAddresses = await context.erc725X
                .connect(context.accounts.owner)
                .callStatic.executeBatch(
                  txParams.Operations,
                  txParams.to,
                  txParams.values,
                  txParams.data,
                );

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operations[0],
                  ethers.utils.getAddress(contractsAddresses[0]),
                  txParams.values[0],
                  ethers.utils.hexZeroPad('0x00', 32),
                )
                .to.emit(context.erc725X, 'ContractCreated')
                .withArgs(
                  txParams.Operations[1],
                  ethers.utils.getAddress(contractsAddresses[1]),
                  txParams.values[1],
                  ethers.utils.hexZeroPad('0x00', 32),
                );

              const codeOfContractCreated1 = await provider.getCode(
                ethers.utils.getAddress(contractsAddresses[0]),
              );

              const codeOfContractCreated2 = await provider.getCode(
                ethers.utils.getAddress(contractsAddresses[1]),
              );

              expect(codeOfContractCreated1).to.equal(WithoutConstructorContractDeployedBytecode);

              expect(codeOfContractCreated2).to.equal(WithoutConstructorContractDeployedBytecode);
            });
          });

          describe('When one creation revert', () => {
            it('should revert with the reason of the creation that reverts', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CREATE, OPERATION_TYPE.CREATE],
                to: [contractThatReverts.address, context.accounts.anyone.address],
                values: [0, 0],
                data: [WithoutConstructorContractBytecode, WithoutConstructorContractBytecode],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_CreateOperationsRequireEmptyRecipientAddress',
              );
            });
          });
        });

        describe('When combining DELEGATECALL and CALL Operations', () => {
          describe('When calling after destructing the contract', () => {
            it('should pass and emit 2 Executed Event and then be destructed', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.DELEGATECALL, OPERATION_TYPE.CALL],
                to: [selfdestructContract.address, targetContract.address],
                values: [0, 0],
                data: [
                  selfdestructContract.interface.encodeFunctionData('destroyMe'),
                  targetContract.interface.encodeFunctionData('increment'),
                ],
              };

              const countBefore = await targetContract.callStatic.count();

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operations[0],
                  txParams.to[0],
                  txParams.values[0],
                  txParams.data[0].substr(0, 10),
                )
                .to.emit(context.erc725X, 'Executed')
                .withArgs(
                  txParams.Operations[1],
                  txParams.to[1],
                  txParams.values[1],
                  txParams.data[1].substr(0, 10),
                );

              const countAfter = await targetContract.callStatic.count();
              expect(countBefore.add(1)).to.equal(countAfter);

              const codeAtERC725X = await provider.getCode(context.erc725X.address);

              expect(codeAtERC725X).to.equal('0x');
            });
          });
        });
      });

      describe('When providing wrong operation type with other operations', () => {
        describe("when it's the first operation in the operation list", () => {
          it('should revert', async () => {
            const txParams = {
              Operations: [5, OPERATION_TYPE.CALL],
              to: [context.accounts.anyone.address, context.accounts.anyone.address],
              values: [0, 0],
              data: ['0x', '0x'],
            };

            await expect(
              context.erc725X
                .connect(context.accounts.owner)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
            ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_UnknownOperationType');
          });
        });
        describe("when it's the last operation in the operation list", () => {
          it('should revert', async () => {
            const txParams = {
              Operations: [OPERATION_TYPE.CALL, 5],
              to: [context.accounts.anyone.address, context.accounts.anyone.address],
              values: [0, 0],
              data: ['0x', '0x'],
            };

            await expect(
              context.erc725X
                .connect(context.accounts.owner)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
            ).to.be.revertedWithCustomError(context.erc725X, 'ERC725X_UnknownOperationType');
          });
        });
      });

      describe('Edge cases ', () => {
        describe('When sending value in second call greater than the balance', () => {
          it('should revert with the custom error', async () => {
            const txParams = {
              Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
              to: [context.accounts.anyone.address, context.accounts.anyone.address],
              values: [ethers.utils.parseEther('10'), ethers.utils.parseEther('99')],
              data: ['0x', '0x'],
            };

            const contractBalance = await provider.getBalance(context.erc725X.address);

            await expect(
              context.erc725X
                .connect(context.accounts.owner)
                .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
            )
              .to.be.revertedWithCustomError(context.erc725X, 'ERC725X_InsufficientBalance')
              .withArgs(contractBalance.sub(txParams.values[0]), txParams.values[1]);
          });
        });
        describe('When passing un-equal parameters number', () => {
          describe('for OperationsType', () => {
            it('should revert with the custom error', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL],
                to: [context.accounts.anyone.address, context.accounts.anyone.address],
                values: [ethers.utils.parseEther('10'), ethers.utils.parseEther('99')],
                data: ['0x', '0x'],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_ExecuteParametersLengthMismatch',
              );
            });
          });
          describe('for to', () => {
            it('should revert with the custom error', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [
                  context.accounts.anyone.address,
                  context.accounts.anyone.address,
                  context.accounts.anyone.address,
                ],
                values: [ethers.utils.parseEther('10'), ethers.utils.parseEther('99')],
                data: ['0x', '0x'],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_ExecuteParametersLengthMismatch',
              );
            });
          });
          describe('for values', () => {
            it('should revert with the custom error', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [context.accounts.anyone.address, context.accounts.anyone.address],
                values: [
                  ethers.utils.parseEther('10'),
                  ethers.utils.parseEther('99'),
                  ethers.utils.parseEther('99'),
                ],
                data: ['0x', '0x'],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_ExecuteParametersLengthMismatch',
              );
            });
          });
          describe('for data', () => {
            it('should revert with the custom error', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL, OPERATION_TYPE.CALL],
                to: [context.accounts.anyone.address, context.accounts.anyone.address],
                values: [ethers.utils.parseEther('10'), ethers.utils.parseEther('10')],
                data: ['0x', '0x', '0x'],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_ExecuteParametersLengthMismatch',
              );
            });
          });

          describe('for more than 1 parameter', () => {
            it('should revert with the custom error', async () => {
              const txParams = {
                Operations: [OPERATION_TYPE.CALL],
                to: [context.accounts.anyone.address, context.accounts.anyone.address],
                values: [ethers.utils.parseEther('10'), ethers.utils.parseEther('10')],
                data: ['0x', '0x', '0x'],
              };

              await expect(
                context.erc725X
                  .connect(context.accounts.owner)
                  .executeBatch(txParams.Operations, txParams.to, txParams.values, txParams.data),
              ).to.be.revertedWithCustomError(
                context.erc725X,
                'ERC725X_ExecuteParametersLengthMismatch',
              );
            });
          });
        });
      });
    });
  });
};

export type ERC725XInitializeTestContext = {
  erc725X: ERC725X;
  deployParams: ERC725XDeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeERC725X = (
  buildContext: () => Promise<ERC725XInitializeTestContext>,
) => {
  let context: ERC725XInitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should have registered the ERC165 interface', async () => {
      expect(await context.erc725X.supportsInterface(INTERFACE_ID.ERC165)).to.be.true;
    });

    it('should have registered the ERC725X interface', async () => {
      expect(await context.erc725X.supportsInterface(INTERFACE_ID.ERC725X));
    });

    it('should have set the correct owner', async () => {
      expect(await context.erc725X.callStatic.owner()).to.equal(context.deployParams.newOwner);
    });

    it('should have funded the contract with `msg.value` when `initialize(...)` was called', async () => {
      expect();
    });
  });
};
