import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export async function deployProxy(
  baseContractAddress: string,
  deployer: SignerWithAddress,
): Promise<string> {
  /**
   * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
   * The first 10 x hex opcodes copy the runtime code into memory and return it.
   */
  const eip1167RuntimeCodeTemplate =
    '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3';

  // deploy proxy contract
  let proxyBytecode = eip1167RuntimeCodeTemplate.replace(
    'bebebebebebebebebebebebebebebebebebebebe',
    baseContractAddress.substr(2),
  );
  let tx = await deployer.sendTransaction({
    data: proxyBytecode,
  });
  let receipt = await tx.wait();

  return receipt.contractAddress;
}
