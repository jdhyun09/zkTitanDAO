import getNextConfig from "next/config"
import { Contract, providers } from "ethers"
import semaphoreABI from "../../../contract-artifacts/semaphoreABI.json"
import getEvents from "./getEvents"

const { publicRuntimeConfig: env } = getNextConfig()

const titanGoerliRPC = "https://rpc.titan-goerli.tokamak.network"
const startBlock = 24100

export default async function getGroupVerifiedProofs(groupId:string): Promise<any> {
    const provider = new providers.JsonRpcProvider(titanGoerliRPC)
    const contract = new Contract(env.SEMAPHORE_CONTRACT_ADDRESS, semaphoreABI, provider)

    const [groupCreatedEvent] = await getEvents(contract, "GroupCreated", [groupId], startBlock)

    if (!groupCreatedEvent) {
        throw new Error(`Group '${groupId}' not found`)
    }

    const proofVerifiedEvents = await getEvents(contract, "ProofVerified", [groupId], startBlock)

    return proofVerifiedEvents.map((event) => ({
        signal: event.signal.toString(),
        merkleTreeRoot: event.merkleTreeRoot.toString(),
        externalNullifier: event.externalNullifier.toString(),
        nullifierHash: event.nullifierHash.toString()
    }))
}