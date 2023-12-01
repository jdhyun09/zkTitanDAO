//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract ZKTitanDAO {
    ISemaphore public semaphore;
    address public owner;
    uint256[] public titanDAO = [0, 1, 2]; // DAOName: [anyone, ton holders, titan Users]

    event TitanDAOAdded(uint256 groupId);
    event TitanDAORefreshed(uint256 startedGroupId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address semaphoreAddress) {
        owner = msg.sender;

        semaphore = ISemaphore(semaphoreAddress);

        semaphore.createGroup(titanDAO[0], 20, address(this));
        semaphore.createGroup(titanDAO[1], 20, address(this));
        semaphore.createGroup(titanDAO[2], 20, address(this));
    }

    function joinGroup(uint256 groupId, uint256 identityCommitment) external onlyOwner {
        semaphore.addMember(groupId, identityCommitment);
    }

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

    function addTitanDAO() external onlyOwner {
        uint256 lastDAOIndex = titanDAO.length - 1;
        titanDAO.push(titanDAO[lastDAOIndex] + 1);

        semaphore.createGroup(titanDAO[lastDAOIndex + 1], 20, address(this));

        emit TitanDAOAdded(titanDAO[lastDAOIndex + 1]);
    }

    function refreshTitanDAO() external onlyOwner {
        for (uint256 i = 0; i < titanDAO.length; i++) {
            titanDAO[i] += titanDAO.length;
        }

        emit TitanDAORefreshed(titanDAO[0]);
    }
}
