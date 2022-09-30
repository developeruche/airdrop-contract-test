import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const fs = require("fs");
const proof_ = require("./valid.json");


async function main() {
  const CLAIMER = "0xf1bb1c7776a2702e28e0adf91152890b4620d56b";
  const CLAIM_AMOUNT = "23000000000000000000";

  console.log("DEPLOYING THE TOKEN");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("DEPLOYING THE AIRDROP CONTRACT");


  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(token.address);
  await airdrop.deployed()


  console.log("SENDING TOKEN TO AIRDROP CONTRACT");
  await token.transfer(airdrop.address, ethers.utils.parseEther("2000"));


  console.log("IMPERSONATING")

  await helpers.impersonateAccount(CLAIMER);
  const impersonatedSigner = await ethers.getSigner(CLAIMER);

  await helpers.setBalance(CLAIMER, ethers.utils.parseEther("2000000"));


  console.log("CLAIMING");  
  await airdrop.connect(impersonatedSigner).claim(proof_, ethers.utils.parseEther("23"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
