import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ERC725Y__factory, ERC725YInit__factory } from '../types';

import {
  getNamedAccounts,
  shouldBehaveLikeERC725Y,
  shouldInitializeLikeERC725Y,
  ERC725YTestContext,
} from './ERC725Y.behaviour';

import { deployProxy } from './fixtures';

describe('ERC725Y', () => {
  describe('when using ERC725Y contract with constructor', () => {
    const buildTestContext = async (): Promise<ERC725YTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        newOwner: accounts.owner.address,
        funding: ethers.utils.parseEther('10'),
      };

      const erc725Y = await new ERC725Y__factory(accounts.owner).deploy(deployParams.newOwner, {
        value: deployParams.funding,
      });

      return { accounts, erc725Y, deployParams };
    };

    describe('when deploying the contract', () => {
      let context: ERC725YTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it('should revert when giving address(0) as owner', async () => {
        const accounts = await getNamedAccounts();

        const deployParams = {
          newOwner: ethers.constants.AddressZero,
        };

        await expect(
          new ERC725Y__factory(accounts.owner).deploy(deployParams.newOwner),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });

      describe('once the contract was deployed', () => {
        shouldInitializeLikeERC725Y(async () => {
          const { erc725Y, deployParams } = context;
          return {
            erc725Y,
            deployParams,
            initializeTransaction: context.erc725Y.deployTransaction,
          };
        });
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeERC725Y(buildTestContext);
    });
  });

  describe('when using ERC725Y contract with proxy', () => {
    const buildTestContext = async (): Promise<ERC725YTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        newOwner: accounts.owner.address,
        funding: ethers.utils.parseEther('10'),
      };

      const erc725YBase = await new ERC725YInit__factory(accounts.owner).deploy();

      const erc725YProxy = await deployProxy(erc725YBase.address, accounts.owner);
      const erc725Y = erc725YBase.attach(erc725YProxy);

      return { accounts, erc725Y, deployParams };
    };

    const initializeProxy = async (context: ERC725YTestContext) => {
      return context.erc725Y['initialize(address)'](context.deployParams.newOwner, {
        value: context.deployParams.funding,
      });
    };

    describe('when deploying the base implementation contract', () => {
      it('prevent any address from calling the initialize(...) function on the implementation', async () => {
        const accounts = await ethers.getSigners();

        const erc725YBase = await new ERC725YInit__factory(accounts[0]).deploy();

        const randomCaller = accounts[1];

        await expect(erc725YBase['initialize(address)'](randomCaller.address)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });

    describe('when deploying the contract as proxy', () => {
      let context: ERC725YTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it('should revert when initializing with address(0) as owner', async () => {
        await expect(
          context.erc725Y['initialize(address)'](ethers.constants.AddressZero),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });

      describe('when initializing the contract', () => {
        shouldInitializeLikeERC725Y(async () => {
          const { erc725Y, deployParams } = context;
          const initializeTransaction = await initializeProxy(context);

          return {
            erc725Y,
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
      shouldBehaveLikeERC725Y(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        }),
      );
    });
  });
});
