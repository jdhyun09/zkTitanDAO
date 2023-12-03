import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { formatBytes32String } from "ethers/lib/utils"
import { ethers } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { ZKTitanDAO } from "../build/typechain"
import { config } from "../package.json"

describe("Feedback", () => {
    let ZKTitanDAOContract: ZKTitanDAO
    let semaphoreContract: string

    const groupId = 0
    const group = new Group(groupId)
    const users: Identity[] = []

    before(async () => {
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        ZKTitanDAOContract = await run("deploy", { logs: false, group: groupId, semaphore: semaphore.address })
        semaphoreContract = semaphore

        users.push(new Identity())
        users.push(new Identity())
    })

    describe("# joinGroup", () => {
        it("Should allow users to join the group", async () => {
            for await (const [i, user] of users.entries()) {
                const transaction = ZKTitanDAOContract.joinGroup(groupId, user.commitment)

                group.addMember(user.commitment)

                await expect(transaction)
                    .to.emit(semaphoreContract, "MemberAdded")
                    .withArgs(groupId, i, user.commitment, group.root)
            }
        })
    })

    describe("# sendFeedback", () => {
        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        it("Should allow users to send feedback anonymously", async () => {
            const feedback = formatBytes32String("Hello World")

            const fullProof = await generateProof(users[1], group, groupId, feedback, {
                wasmFilePath,
                zkeyFilePath
            })

            const transaction = ZKTitanDAOContract.sendFeedback(
                feedback,
                groupId,
                fullProof.merkleTreeRoot,
                fullProof.nullifierHash,
                groupId,
                fullProof.proof
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofVerified")
                .withArgs(groupId, fullProof.merkleTreeRoot, fullProof.nullifierHash, groupId, fullProof.signal)
        })
    })

    describe("# addTitanDAO", () => {
        it("Should allow adding a new group.", async () => {
            const newGroupId = 3
            const newGroup = new Group(newGroupId)

            const transaction = ZKTitanDAOContract.addTitanDAO()

            await expect(transaction).to.emit(ZKTitanDAOContract, "TitanDAOAdded").withArgs(newGroupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(newGroupId, 20, newGroup.zeroValue)
        })
    })

    describe("# refreshTitanDAO", () => {
        it("Should refresh titanDAO groups", async () => {
            const newGroupId = [4, 5, 6, 7]
            const newGroup1 = new Group(newGroupId[0])
            const newGroup2 = new Group(newGroupId[1])
            const newGroup3 = new Group(newGroupId[2])
            const newGroup4 = new Group(newGroupId[3])

            const transaction = ZKTitanDAOContract.refreshTitanDAO()

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(newGroupId[0], 20, newGroup1.zeroValue)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(newGroupId[1], 20, newGroup2.zeroValue)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(newGroupId[2], 20, newGroup3.zeroValue)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(newGroupId[3], 20, newGroup4.zeroValue)
            await expect(transaction).to.emit(ZKTitanDAOContract, "TitanDAORefreshed").withArgs(newGroupId[0])
        })
    })

    describe("# transferOwnership", () => {
        it("Should change the owner", async () => {
            const oldOwner = ethers.utils.getAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
            const newOwner = ethers.utils.getAddress("0x1234567891234567891234567891234567891234")

            const transaction = ZKTitanDAOContract.transferOwnership(newOwner)

            await expect(transaction).to.emit(ZKTitanDAOContract, "OwnerChanged").withArgs(oldOwner, newOwner)
        })
    })
})
