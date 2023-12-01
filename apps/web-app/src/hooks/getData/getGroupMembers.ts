import getNextConfig from "next/config"
import { Contract, providers } from "ethers"
import semaphoreABI from "../../../contract-artifacts/semaphoreABI.json"
import getEvents from "./getEvents"

const { publicRuntimeConfig: env } = getNextConfig()

const titanGoerliRPC = "https://rpc.titan-goerli.tokamak.network"
const startBlock = 24100

export default async function getGroupMembers(groupId: string): Promise<string[]> {
    const provider = new providers.JsonRpcProvider(titanGoerliRPC)
    const contract = new Contract(env.SEMAPHORE_CONTRACT_ADDRESS, semaphoreABI, provider)

    const [groupCreatedEvent] = await getEvents(contract, "GroupCreated", [groupId], startBlock)

    if (!groupCreatedEvent) {
        throw new Error(`Group ${groupId} is not found`)
    }

    const zeroValue = groupCreatedEvent.zeroValue.toString()
    const memberRemovedEvents = await getEvents(contract, "MemberRemoved", [groupId], startBlock)
    const memberUpdatedEvents = await getEvents(contract, "MemberUpdated", [groupId], startBlock)

    const groupUpdates = new Map<string, [number, string]>()

    for (const { blockNumber, index, newIdentityCommitment } of memberUpdatedEvents) {
        groupUpdates.set(index.toString(), [blockNumber, newIdentityCommitment.toString()])
    }

    for (const { blockNumber, index } of memberRemovedEvents) {
        const groupUpdate = groupUpdates.get(index.toString())

        if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
            groupUpdates.set(index.toString(), [blockNumber, zeroValue])
        }
    }

    const memberAddedEvents = await getEvents(contract, "MemberAdded", [groupId], startBlock)
    const members: string[] = []

    for (const { index, identityCommitment } of memberAddedEvents) {
        const groupUpdate = groupUpdates.get(index.toString())
        const member = groupUpdate ? groupUpdate[1].toString() : identityCommitment.toString()

        members.push(member)
    }

    return members
}
