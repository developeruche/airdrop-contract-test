import { ethers } from "hardhat";

//generate a merkle tree for gotchis
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const csv = require("csv-parser");
const fs = require("fs");
var utils = require("ethers").utils;


function main() {

  let root;
  const filename = __dirname + "/files/list.csv";
  const output_file = "file/proof.json";
  const userclaimFile = "file/valid.json";

  let proof: any;

  //contract of items being sent out
  const airdropContract = "0x027Ffd3c119567e85998f4E6B9c3d83D5702660c";

  const CLAIMER = "0xf1bb1c7776a2702e28e0adf91152890b4620d56b"
  const AMOUNT = ethers.utils.parseEther("23")//"23000000000000000000"

  // used to store one leaf for each line in the distribution file
  const token_dist : any = [];

  // used for tracking gotchi_id of each leaf so we can write to proofs file accordingly
  const gotchi_dist_list : any = [];

  // open distribution csv
  fs.createReadStream(filename)
    .pipe(csv())
    .on("data", (row : any) => {
      const gotchi_dist = [row["address"], row["amount"]];
      const leaf_hash = utils.solidityKeccak256(
        ["address", "uint256"],
        [row["address"], row["amount"]]
      ); // encode base data like solidity abi.encode
      gotchi_dist_list.push(gotchi_dist); // add record to index tracker
      token_dist.push(leaf_hash); // add leaf hash to distribution
    })
    .on("end", () => {
      // create merkle tree from token distribution
      const merkle_tree = new MerkleTree(token_dist, keccak256, {
        sortPairs: true,
      });
      // get root of our tree
      root = merkle_tree.getHexRoot();
      // create proof file
    //   write_leaves(merkle_tree, gotchi_dist_list, token_dist, root);

      proof = merkle_tree.getHexProof(utils.solidityKeccak256(
        ["address", "uint256"],
        gotchi_dist_list[0]
      ));

      const data = JSON.stringify(proof);

      fs.writeFile(`${__dirname}/valid.json`, data, (err : any) =>{
        if(err){
          console.log("Error writing file" ,err)
        } else {
          console.log('JSON data is written to the file successfully')
        }
       })
    });
}








module.exports = {main};






























































/**
 
  // write leaves & proofs to json file
  function write_leaves(merkle_tree: any, gotchi_dist_list: any, token_dist: any, root: any) {
    console.log("Begin writing leaves to file...");
    full_dist = {};
    full_gotchi_claim = {};

    let dropObjs = {
      dropDetails: {
        contractAddress: airdropContract,
        merkleroot: root,
      },
    };

    for (line = 0; line < gotchi_dist_list.length; line++) {
      // generate leaf hash from raw data
      const leaf = token_dist[line];

      // create dist object
      const gotchi_dist = {
        leaf: leaf,
        proof: merkle_tree.getHexProof(leaf),
      };
      // add record to our distribution
      full_dist[gotchi_dist_list[line][0]] = gotchi_dist;
      //console.log(gotchi_dist_list)
    }

    fs.writeFile(output_file, JSON.stringify(full_dist, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      }

      for (line = 0; line < gotchi_dist_list.length; line++) {
        const other = gotchi_dist_list[line];
        // console.log(gotchi_dist_list[line])
        const gotchi_claim = {
          tokenID: other[0],
          itemID: other[1],
          amount: other[2],
        };
        full_gotchi_claim[gotchi_dist_list[line][0]] = gotchi_claim;
      }
      let newObj = Object.assign(full_gotchi_claim, dropObjs);
      //append to airdrop list to have comprehensive overview
      fs.writeFile(userclaimFile, JSON.stringify(newObj, null, 4), (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });

      console.log(output_file, "has been written with a root hash of:\n", root);
    });

    // return root;
  }
 * 
 */