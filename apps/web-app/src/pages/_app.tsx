/* eslint-disable import/no-duplicates */
import { ChakraProvider, Container, HStack, Spinner, Stack, Text } from "@chakra-ui/react"

import { WagmiConfig, createConfig, configureChains, Chain } from "wagmi"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"
import { goerli } from "wagmi/chains"
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit"
import { ConnectButton } from "@rainbow-me/rainbowkit"
// import { SupportedNetwork } from "@semaphore-protocol/data"
import type { AppProps } from "next/app"
import getNextConfig from "next/config"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"
import theme from "../styles/index"

const { publicRuntimeConfig: env } = getNextConfig()

const titan: Chain = {
    id: 55004,
    name: "Titan",
    network: "Titan",
    nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH"
    },
    rpcUrls: {
        public: { http: ["https://rpc.titan.tokamak.network"] },
        default: { http: ["https://rpc.titan.tokamak.network"] }
    },
    blockExplorers: {
        etherscan: {
            name: "Titan Mainnet Explorer",
            url: process.env.NEXT_PUBLIC_TITAN_BLOCKEXPLORER as string
        },
        default: {
            name: "Titan Mainnet Explorer",
            url: process.env.NEXT_PUBLIC_TITAN_BLOCKEXPLORER as string
        }
    }
}

const titan_goerli: Chain = {
    id: 5050,
    name: "Titan Goerli",
    network: "Titan Goerli",
    nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH"
    },
    rpcUrls: {
        public: { http: ["https://rpc.titan-goerli.tokamak.network"] },
        default: { http: ["https://rpc.titan-goerli.tokamak.network"] }
    },
    blockExplorers: {
        etherscan: {
            name: "BlockScout",
            url: "https://goerli.explorer.tokamak.network/"
        },
        default: {
            name: "BlockScout",
            url: "https://goerli.explorer.tokamak.network/"
        }
    }
}

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [goerli, titan_goerli, titan],
    [alchemyProvider({ apiKey: "yourAlchemyApiKey" }), publicProvider()]
)

const projectId = "zkTitanDAO"

const { connectors } = getDefaultWallets({
    appName: "RainbowKit demo",
    projectId,
    chains
})

// Set up wagmi config
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient
})

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const semaphore = useSemaphore()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [semaphore._groupId])

    // function getExplorerLink(network: SupportedNetwork, address: string) {
    //     switch (network) {
    //         case "goerli":
    //         case "sepolia":
    //             return `https://${network}.etherscan.io/address/${address}`
    //         case "arbitrum-goerli":
    //             return `https://goerli.arbiscan.io/address/${address}`
    //         default:
    //             return ""
    //     }
    // }

    // console.log(signMessage)

    return (
        <>
            <Head>
                <title>Semaphore boilerplate</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>
            <ChakraProvider theme={theme}>
                <WagmiConfig config={wagmiConfig}>
                    <RainbowKitProvider chains={chains}>
                        <HStack align="center" justify="right" p="2">
                            <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
                                <ConnectButton />
                            </div>
                        </HStack>

                        <Container maxW="lg" flex="1" display="flex" alignItems="center">
                            <Stack py="8" display="flex" width="100%">
                                <SemaphoreContext.Provider value={semaphore}>
                                    <LogsContext.Provider
                                        value={{
                                            _logs,
                                            setLogs
                                        }}
                                    >
                                        <Component {...pageProps} />
                                    </LogsContext.Provider>
                                </SemaphoreContext.Provider>
                            </Stack>
                        </Container>

                        <HStack
                            flexBasis="56px"
                            borderTop="1px solid #8f9097"
                            backgroundColor="#DAE0FF"
                            align="center"
                            justify="center"
                            spacing="4"
                            p="4"
                        >
                            {_logs.endsWith("...") && <Spinner color="primary.400" />}
                            <Text fontWeight="bold">{_logs || `Current step: ${router.route}`}</Text>
                        </HStack>
                    </RainbowKitProvider>
                </WagmiConfig>
            </ChakraProvider>
        </>
    )
}
