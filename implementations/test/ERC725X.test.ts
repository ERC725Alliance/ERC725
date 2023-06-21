import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ERC725X__factory, ERC725XInit__factory } from '../types';

import {
  getNamedAccounts,
  shouldBehaveLikeERC725X,
  shouldInitializeLikeERC725X,
  ERC725XTestContext,
} from './ERC725X.behaviour';

import { deployProxy } from './fixtures';

describe('ERC725X', () => {
  describe('when using ERC725X contract with constructor', () => {
    const buildTestContext = async (): Promise<ERC725XTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        newOwner: accounts.owner.address,
      };

      const erc725X = await new ERC725X__factory(accounts.owner).deploy(deployParams.newOwner);

      return { accounts, erc725X, deployParams };
    };

    describe('when deploying the contract', () => {
      it('should revert when giving address(0) as owner', async () => {
        const accounts = await getNamedAccounts();

        const deployParams = {
          newOwner: ethers.constants.AddressZero,
        };

        await expect(
          new ERC725X__factory(accounts.owner).deploy(deployParams.newOwner),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });

      it('should deploy and fund the contract with `msg.value`', async () => {
        const accounts = await getNamedAccounts();

        const deployParams = {
          newOwner: accounts.owner.address,
          funding: ethers.utils.parseEther('10'),
        };

        const contract = await new ERC725X__factory(accounts.owner).deploy(deployParams.newOwner, {
          value: deployParams.funding,
        });

        expect(await ethers.provider.getBalance(contract.address)).to.equal(deployParams.funding);
      });

      describe('once the contract was deployed', () => {
        let context: ERC725XTestContext;

        beforeEach(async () => {
          context = await buildTestContext();
        });

        shouldInitializeLikeERC725X(async () => {
          const { erc725X, deployParams } = context;
          return {
            erc725X,
            deployParams,
            initializeTransaction: context.erc725X.deployTransaction,
          };
        });
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeERC725X(buildTestContext);
    });
  });

  describe('when using ERC725X contract with proxy', () => {
    const buildTestContext = async (): Promise<ERC725XTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        newOwner: accounts.owner.address,
        funding: ethers.utils.parseEther('10'),
      };

      const erc725XBase = await new ERC725XInit__factory(accounts.owner).deploy();

      const erc725XProxy = await deployProxy(erc725XBase.address, accounts.owner);
      const erc725X = erc725XBase.attach(erc725XProxy);

      return { accounts, erc725X, deployParams };
    };

    const initializeProxy = async (context: ERC725XTestContext) => {
      return context.erc725X['initialize(address)'](context.deployParams.newOwner, {
        value: context.deployParams.funding,
      });
    };

    describe('when deploying the base implementation contract', () => {
      it('prevent any address from calling the initialize(...) function on the implementation', async () => {
        const accounts = await ethers.getSigners();

        const erc725XBase = await new ERC725XInit__factory(accounts[0]).deploy();

        const randomCaller = accounts[1];

        await expect(erc725XBase['initialize(address)'](randomCaller.address)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });

    describe('when deploying the contract as proxy', () => {
      let context: ERC725XTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it('should revert when initializing with address(0) as owner', async () => {
        await expect(
          context.erc725X['initialize(address)'](ethers.constants.AddressZero),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });

      describe('when initializing the contract', () => {
        shouldInitializeLikeERC725X(async () => {
          const { erc725X, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            erc725X,
            deployParams,
            initializeTransaction,
          };
        });
      });

      describe('when calling initialize more than once', () => {
        it('should revert', async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).to.be.revertedWith(
            'Initializable: contract is already initialized',
          );
        });
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeERC725X(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        }),
      );
    });
  });
});
