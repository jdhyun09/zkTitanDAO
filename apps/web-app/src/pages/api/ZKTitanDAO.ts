import { Contract, providers, Wallet } from "ethers"
import type { NextApiRequest, NextApiResponse } from "next"
import ZKTitanDAO from "../../../contract-artifacts/ZKTitanDAO.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof process.env.ZKTITANDAO_CONTRACT_ADDRESS !== "string") {
        throw new Error("Please, define FEEDBACK_CONTRACT_ADDRESS in your .env file")
    }

    if (typeof process.env.DEFAULT_NETWORK !== "string") {
        throw new Error("Please, define DEFAULT_NETWORK in your .env file")
    }

    if (typeof process.env.INFURA_API_KEY !== "string") {
        throw new Error("Please, define INFURA_API_KEY in your .env file")
    }

    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const ethereumNetwork = process.env.DEFAULT_NETWORK
    const infuraApiKey = process.env.INFURA_API_KEY
    const contractAddress = process.env.ZKTITANDAO_CONTRACT_ADDRESS

    const provider =
        ethereumNetwork === "localhost"
            ? new providers.JsonRpcProvider("http://127.0.0.1:8545")
            : new providers.InfuraProvider(ethereumNetwork, infuraApiKey)

    const signer = new Wallet(ethereumPrivateKey, provider)
    const contract = new Contract(contractAddress, ZKTitanDAO.abi, signer)

    const { feedback, groupId, merkleTreeRoot, nullifierHash, proof } = req.body

    try {
        const transaction = await contract.sendFeedback(
            feedback,
            groupId,
            merkleTreeRoot,
            nullifierHash,
            groupId,
            proof
        )

        await transaction.wait()

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
}
