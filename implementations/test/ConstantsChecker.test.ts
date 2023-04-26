import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { ConstantsChecker, ConstantsChecker__factory } from '../types';

// utils
import { INTERFACE_ID, FUNCTIONS_SELECTOR } from '../constants';

describe('Constants Checker', () => {
  let accounts: SignerWithAddress[];
  let contract: ConstantsChecker;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new ConstantsChecker__factory(accounts[0]).deploy();
  });

  describe('Calculating ERC165InterfaceIds', () => {
    it('ERC725X', async () => {
      const result = await contract.getERC725XInterfaceID();
      expect(result).to.equal(INTERFACE_ID.ERC725X);
    });

    it('ERC725Y', async () => {
      const result = await contract.getERC725YInterfaceID();
      expect(result).to.equal(INTERFACE_ID.ERC725Y);
    });
  });

  describe('Calculating Functions selectors', () => {
    describe('ERC725X', () => {
      it('execute selector', async () => {
        const result = await contract.getExecuteSelector();
        expect(result).to.equal(FUNCTIONS_SELECTOR.EXECUTE);
      });

      it('execute array selector', async () => {
        const result = await contract.getExecuteArraySelector();
        expect(result).to.equal(FUNCTIONS_SELECTOR.EXECUTE_BATCH);
      });
    });

    describe('ERC725Y', () => {
      it('setData selector', async () => {
        const result = await contract.getSetDataSelector();
        expect(result).to.equal(FUNCTIONS_SELECTOR.SETDATA);
      });

      it('setData array selector', async () => {
        const result = await contract.getSetDataArraySelector();
        expect(result).to.equal(FUNCTIONS_SELECTOR.SETDATA_BATCH);
      });
    });
  });
});
