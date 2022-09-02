import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { ERC165InterfaceIDs, ERC165InterfaceIDs__factory } from "../types";

// utils
import { INTERFACE_ID } from "../constants";

describe("Calculate ERC725 InterfaceIDs", () => {
  let accounts: SignerWithAddress[];
  let contract: ERC165InterfaceIDs;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new ERC165InterfaceIDs__factory(accounts[0]).deploy();
  });

  it("ERC725X", async () => {
    const result = await contract.getERC725XInterfaceID();
    expect(result).to.equal(INTERFACE_ID.ERC725X);
  });

  it("ERC725Y", async () => {
    const result = await contract.getERC725YInterfaceID();
    expect(result).to.equal(INTERFACE_ID.ERC725Y);
  });
});
