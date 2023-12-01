import { Contract, providers, Wallet } from "ethers"
import type { NextApiRequest, NextApiResponse } from "next"
import ZKTitanDAO from "../../../contract-artifacts/ZKTitanDAO.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof process.env.ZKTITANDAO_CONTRACT_ADDRESS !== "string") {
        throw new Error("Please, define FEEDBACK_CONTRACT_ADDRESS in your .env file")
    }

    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const contractAddress = process.env.ZKTITANDAO_CONTRACT_ADDRESS

    const provider = new providers.JsonRpcProvider("https://rpc.titan-goerli.tokamak.network")

    const signer = new Wallet(ethereumPrivateKey, provider)
    const contract = new Contract(contractAddress, ZKTitanDAO.abi, signer)

    const { identityCommitment, groupId } = req.body

    try {
        const transaction = await contract.joinGroup(groupId, identityCommitment)

        await transaction.wait()

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
}
