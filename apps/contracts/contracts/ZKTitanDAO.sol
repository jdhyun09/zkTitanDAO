//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

/// @title ZKTitanDAO Contract
/// @dev ZKTitanDAO is used for creating and managing DAO groups based on the Semaphore protocol.
/// Currently, three fixed DAO groups are defined, with the capability to add more groups in the future.
/// The actual group logic and zkSNARK proof verification are carried out in the Semaphore Contract.
/// ZKTitanDAO facilitates these functionalities in a user-friendly way.
/// Its primary role is to intuitively manage specific groups and to transmit zkSNARK proofs to Semaphore
/// for the validation of Feedback authenticity.
contract ZKTitanDAO {
    ISemaphore public semaphore;
    address public owner;
    uint256[] public titanDAO = [0, 1, 2]; // DAOName: [anyone, ton holders, titan Users]

    /// @dev Triggered when a new TitanDAO group is added.
    /// @param groupId The ID of the newly added DAO group.
    event TitanDAOAdded(uint256 groupId);

    /// @dev Triggered when TitanDAO groups are refreshed.
    /// @param startedGroupId The starting ID of the refreshed DAO groups.
    event TitanDAORefreshed(uint256 startedGroupId);

    /// @dev Triggered when the ownership of the contract is transferred.
    /// @param oldOwner The address of the previous owner.
    /// @param newOwner The address of the new owner.
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @dev Initializes the ZKTitanDAO contract with the specified Semaphore address.
    /// The current version assumes that Semaphore is only used via ZKTitanDAO.
    /// @param semaphoreAddress The address of the Semaphore contract.
    constructor(address semaphoreAddress) {
        owner = msg.sender;

        semaphore = ISemaphore(semaphoreAddress);

        semaphore.createGroup(titanDAO[0], 20, address(this));
        semaphore.createGroup(titanDAO[1], 20, address(this));
        semaphore.createGroup(titanDAO[2], 20, address(this));
    }

    /// @dev Adds a new member to a specified DAO group.
    /// Can only be called by the contract owner.
    /// More details {ISemaphore-addMembers}.
    /// @param groupId The ID of the DAO group.
    /// @param identityCommitment The identity commitment of the new member.
    function joinGroup(uint256 groupId, uint256 identityCommitment) external onlyOwner {
        semaphore.addMember(groupId, identityCommitment);
    }

    /// @notice Sends feedback with zkSNARK proof to Semaphore for verification.
    /// More details {ISemaphore-verifyProof}.
    /// @param feedback The feedback to be sent.
    /// @param groupId The ID of the DAO group.
    /// @param merkleTreeRoot The Merkle tree root.
    /// @param nullifierHash The nullifier hash.
    /// @param externalNullifier The external nullifier.
    /// @param proof The zkSNARK proof.
    function sendFeedback(
        uint256 feedback,
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external {
        semaphore.verifyProof(groupId, merkleTreeRoot, feedback, nullifierHash, externalNullifier, proof);
    }

    /// @dev Adds a new TitanDAO group.
    /// Can only be called by the contract owner.
    function addTitanDAO() external onlyOwner {
        uint256 newGroupId = titanDAO[titanDAO.length - 1] + 1;
        titanDAO.push(newGroupId);

        semaphore.createGroup(newGroupId, 20, address(this));

        emit TitanDAOAdded(newGroupId);
    }

    /// @dev Refreshes the IDs of all TitanDAO groups.
    /// Can only be called by the contract owner.
    function refreshTitanDAO() external onlyOwner {
        for (uint256 i = 0; i < titanDAO.length; i++) {
            titanDAO[i] += titanDAO.length;
            semaphore.createGroup(titanDAO[i], 20, address(this));
        }

        emit TitanDAORefreshed(titanDAO[0]);
    }

    /// @dev Transfers the ownership of the contract to a new address.
    /// Can only be called by the current owner.
    /// @param newOwner The address to which ownership will be transferred.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner cannot be the current owner");

        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}
