// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";




contract Airdrop {
    /// @dev this is the merkle root computed from the valid addresses
    bytes32 public merkleRoot = 0x2ef65c1a0709bd9f7fdc4cb5950a767c9489f04826d4b6b380de7e00ce4a32a7;

    /// @dev this mapping would be used to map users to a bool to make sure the user has not claimed before
    mapping(address => bool) public claimed;



    /// @dev the is the address of the NRF token to tbe sent to user
    address claimTokenAddress;
    address admin;



    // ERROR

    /// You have already claimed airdrop
    error HasAlreadyClaimed();
    /// Address is not eligible
    error YouAreNotEligible();
    /// Error while sending tokens
    error TransferFailed();
    /// You are not the admin 
    error NotAdmin();


    // EVENT

    event Claimed(address claimer, uint256 amount);

    /// @dev setting the amount a user would be claiming 
    /// @param _claimTokenAddress: NRF token address
    constructor(address _claimTokenAddress) {
        claimTokenAddress = _claimTokenAddress;
    }

    


    function canClaim(bytes32[] calldata _merkleProof, uint256 _amount) internal view returns(bool status) {
        if(claimed[msg.sender]) {
            revert HasAlreadyClaimed();
        }
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        if(!MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            revert YouAreNotEligible();
        }
        status = true;
    }


    /// @dev this function would user called by a user seeking to claim their  airdrop 
    /// @param _merkleProof: this is the proof the user would use to claim their airdrop, this proof would be provided to the user by the frontend 
    function claim(bytes32[] calldata _merkleProof, uint256 _amount) public {
        bool status = canClaim(_merkleProof, _amount);

        if(!status) {
            revert YouAreNotEligible();
        }

        claimed[msg.sender] = true;
        // sending the erc 20 token
        bool sent = IERC20(claimTokenAddress).transfer(msg.sender, _amount);

        if(!sent) {
            revert TransferFailed();
        }
        
        
        emit Claimed(msg.sender, _amount);
    }

    /// @dev this token would be used by the admin to move out token left after the airdrop (if there is any)
    /// @param _to: this is the address the token would be transfered to
    function removeLeftOver(address _to) public {
        if(msg.sender != admin) {
            revert NotAdmin();
        }

        // obtaining the balance
        uint256 bal = IERC20(claimTokenAddress).balanceOf(address(this));

        // transfering the balance from the contract to the specified address 
        bool sent = IERC20(claimTokenAddress).transfer(_to, bal);

        if(!sent) {
            revert TransferFailed();
        }
    }
}