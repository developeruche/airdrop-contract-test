import { ethers } from "hardhat";

async function main() {
  console.log("DEPLOYING THE TOKEN");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("DEPLOYING THE AIRDROP CONTRACT");


  const Airdrop = ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(token.address);
  await airdrop.deployed()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
