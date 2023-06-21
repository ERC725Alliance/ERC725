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

        await expect(
          new ERC725__factory(accounts[0]).deploy(deployParams.newOwner),
        ).to.be.revertedWith('Ownable: new owner is the zero address');
      });

      it("should deploy the contract with the owner's address", async () => {
        const accounts = await ethers.getSigners();

        const deployParams = {
          newOwner: accounts[0].address,
        };

        const contract = await new ERC725__factory(accounts[0]).deploy(deployParams.newOwner);

        expect(await contract.owner()).to.equal(deployParams.newOwner);
      });

      it('should deploy and fund the contract with `msg.value`', async () => {
        const accounts = await ethers.getSigners();

        const deployParams = {
          newOwner: accounts[0].address,
          funding: ethers.utils.parseEther('10'),
        };

        const contract = await new ERC725__factory(accounts[0]).deploy(deployParams.newOwner, {
          value: deployParams.funding,
        });

        expect(await ethers.provider.getBalance(contract.address)).to.equal(deployParams.funding);
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

      it("should initialize the contract with the owner's address", async () => {
        await context.erc725['initialize(address)'](context.deployParams.newOwner);
        expect(await context.erc725.owner()).to.equal(context.deployParams.newOwner);
      });

      it('should initialize and fund the contract with `msg.value`', async () => {
        const funding = ethers.utils.parseEther('10');

        await context.erc725['initialize(address)'](context.deployParams.newOwner, {
          value: funding,
        });

        expect(await ethers.provider.getBalance(context.erc725.address)).to.equal(funding);
      });
    });
  });
});
