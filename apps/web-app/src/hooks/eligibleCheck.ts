import getNextConfig from "next/config"
import { Contract, ethers } from "ethers"
import goerliTON_ABI from "../../contract-artifacts/goerliTON_ABI.json"
import titan_goerliTON_ABI from "../../contract-artifacts/titan_goerliTON_ABI.json"
import titanTON_ABI from "../../contract-artifacts/titanTON_ABI.json"
import titanNFT_ABI from "../../contract-artifacts/titanNFT_ABI.json"

const { publicRuntimeConfig: env } = getNextConfig()

const ethereumNetwork = env.DEFAULT_NETWORK === "localhost" ? "http://localhost:8545" : env.DEFAULT_NETWORK

const infuraAPI = env.INFURA_API_KEY
const titanGoerliRPC = "https://rpc.titan-goerli.tokamak.network"
const titanRPC = "https://rpc.titan.tokamak.network"

export default async function eligibleCheck(groupId: string, address: string): Promise<{ result: boolean }> {
    let provider

    let tonAddress
    let titanNFTAddress
    let tonContract
    let titanNFTContract

    switch (ethereumNetwork) {
        case "goerli":
            provider = new ethers.providers.InfuraProvider(ethereumNetwork, infuraAPI)
            tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
            tonContract = new Contract(tonAddress, goerliTON_ABI, provider)
            titanNFTAddress = "NOT"
            break
        case "titan_goerli":
            provider = new ethers.providers.JsonRpcProvider(titanGoerliRPC)
            tonAddress = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa"
            tonContract = new Contract(tonAddress, titan_goerliTON_ABI, provider)
            titanNFTAddress = "NOT"
            break
        case "titan":
            provider = new ethers.providers.JsonRpcProvider(titanRPC)
            tonAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
            tonContract = new Contract(tonAddress, titanTON_ABI, provider)
            titanNFTAddress = "0x33Ca9E08b04E20eF3Beef4D77b18D8D4323FFf10"
            titanNFTContract = new Contract(titanNFTAddress, titanNFT_ABI, provider)
            break
        default:
            console.error("ERROR: Network Error")
            return { result: false }
    }

    switch (groupId) {
        case "0":
            console.log("anyone can pass")
            return { result: true }
        case "1":
            if (!tonContract) {
                console.error("Error: ton contract is wrong")
                return { result: false }
            }

            try {
                const balance = await tonContract.balanceOf(address)
                console.error(address)
                console.error(ethers.utils.formatEther(balance))
                console.log("Ton balance : ", balance)
                const hasOneTon = parseFloat(ethers.utils.formatEther(balance)) >= 1
                console.log(hasOneTon)
                return { result: hasOneTon }
            } catch (error) {
                console.error("Error checking balance:", error)
                return { result: false }
            }
        case "2":
            if (!titanNFTContract) {
                console.error("Error: This network does not supported titan NFT holders group")
                return { result: false }
            }

            try {
                const balance = await titanNFTContract._ownedTokensCount(address)
                console.log("NFT balance : ", balance)
                const hasOneNFT = parseInt(ethers.utils.formatEther(balance), 10) >= 1
                console.log(hasOneNFT)
                return { result: hasOneNFT }
            } catch (error) {
                console.error("Error checking balance:", error)
                return { result: false }
            }
        default:
            console.error("Error: The groupId is not supported")
            return { result: false }
    }
}
