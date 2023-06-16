import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { ConstantsChecker, ConstantsChecker__factory } from '../types';

// utils
import { INTERFACE_ID } from '../constants';

describe('Calculating ERC165InterfaceIds', () => {
  let accounts: SignerWithAddress[];
  let contract: ConstantsChecker;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new ConstantsChecker__factory(accounts[0]).deploy();
  });

  it('ERC725X', async () => {
    const result = await contract.getERC725XInterfaceID();
    expect(result).to.equal(INTERFACE_ID.ERC725X);
  });

  it('ERC725Y', async () => {
    const result = await contract.getERC725YInterfaceID();
    expect(result).to.equal(INTERFACE_ID.ERC725Y);
  });
});
