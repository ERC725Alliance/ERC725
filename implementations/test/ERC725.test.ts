import { ethers } from 'hardhat';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// types
import { ERC725, ERC725__factory, ERC725Init__factory } from '../types';

import { deployProxy } from './fixtures';

type ERC725DeployParams = {
  newOwner: string;
};

type ERC725TestContext = {
  accounts: SignerWithAddress[];
  erc725: ERC725;
  deployParams: ERC725DeployParams;
};

describe('ERC725', () => {
  describe('when using ERC725 with constructor', () => {
    describe('when deploying the contract', () => {
      it('should revert when giving address(0) as owner', async () => {
        const accounts = await ethers.getSigners();

        const deployParams = {
          newOwner: ethers.constants.AddressZero,
        };

        const contract = await new ERC725__factory(accounts[0]).deploy(accounts[0].address);

        await expect(
          new ERC725__factory(accounts[0]).deploy(deployParams.newOwner),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });
    });
  });

  describe('when using ERC725 with proxy', () => {
    const buildTestContext = async (): Promise<ERC725TestContext> => {
      const accounts = await ethers.getSigners();

      const deployParams = {
        newOwner: accounts[0].address,
      };

      const erc725Base = await new ERC725Init__factory(accounts[0]).deploy();

      const erc725Proxy = await deployProxy(erc725Base.address, accounts[0]);
      const erc725 = erc725Base.attach(erc725Proxy);

      return { accounts, erc725, deployParams };
    };

    describe('when deploying the base implementation contract', () => {
      it('prevent any address from calling the initialize(...) function on the implementation', async () => {
        const accounts = await ethers.getSigners();

        const erc725Base = await new ERC725Init__factory(accounts[0]).deploy();

        const randomCaller = accounts[1];

        await expect(erc725Base['initialize(address)'](randomCaller.address)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });

    describe('when deploying the contract as proxy', () => {
      let context: ERC725TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it('should revert when initializing with address(0) as owner', async () => {
        await expect(
          context.erc725['initialize(address)'](ethers.constants.AddressZero),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });
    });
  });
});
