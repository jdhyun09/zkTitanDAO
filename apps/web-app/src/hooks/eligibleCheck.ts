import getNextConfig from "next/config"
import { Contract, ethers } from "ethers"
import goerliTON_ABI from "../../contract-artifacts/goerliTON_ABI.json"
import titan_goerliTON_ABI from "../../contract-artifacts/titan_goerliTON_ABI.json"
import titanTON_ABI from "../../contract-artifacts/titanTON_ABI.json"

const { publicRuntimeConfig: env } = getNextConfig()

const ethereumNetwork = env.DEFAULT_NETWORK === "localhost" ? "http://localhost:8545" : env.DEFAULT_NETWORK

const infuraAPI = env.INFURA_API_KEY
const titanGoerliRPC = "https://rpc.titan-goerli.tokamak.network"
const titanRPC = "https://rpc.titan.tokamak.network"

export default async function eligibleCheck(groupId: string, address: string): Promise<boolean> {
    let provider

    let tonAddress
    let tonContract

    switch (ethereumNetwork) {
        case "goerli":
            provider = new ethers.providers.InfuraProvider(ethereumNetwork, infuraAPI)
            tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
            tonContract = new Contract(tonAddress, goerliTON_ABI, provider)
            break
        case "titan_goerli":
            provider = new ethers.providers.JsonRpcProvider(titanGoerliRPC)
            tonAddress = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa"
            tonContract = new Contract(tonAddress, titan_goerliTON_ABI, provider)
            break
        case "titan":
            provider = new ethers.providers.JsonRpcProvider(titanRPC)
            tonAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
            tonContract = new Contract(tonAddress, titanTON_ABI, provider)
            break
        default:
            console.error("ERROR: Network Error")
            return false
    }

    switch (groupId) {
        case "0":
            console.log("anyone can pass")
            return true
        case "1":
            if (!tonContract) {
                console.error("Error: ton contract is wrong")
                return false
            }

            try {
                const balance = await tonContract.balanceOf(address)
                console.log("Ton balance : ", ethers.utils.formatEther(balance))
                const hasOneTon = parseFloat(ethers.utils.formatEther(balance)) >= 1
                return hasOneTon
            } catch (error) {
                console.error("Error checking balance:", error)
                return false
            }
        case "2":
            try {
                const txCount = await provider.getTransactionCount(address)
                console.log("transaction count : ", txCount)
                return txCount >= 10
            } catch (error) {
                console.error("Error checking transaction count:", error)
                return false
            }
        default:
            console.error("Error: The groupId is not supported")
            return false
    }
}
