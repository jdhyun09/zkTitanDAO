/* eslint-disable import/no-duplicates */
import { ChakraProvider, Container, HStack, Link, Spinner, Stack, Text, Image } from "@chakra-ui/react"
import getNextConfig from "next/config"
import { WagmiConfig, createConfig, configureChains, Chain } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"
import theme from "../styles/index"

const { publicRuntimeConfig: env } = getNextConfig()

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
const { chains, publicClient, webSocketPublicClient } = configureChains([titan_goerli], [publicProvider()])

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

    return (
        <>
            <Head>
                <title>zkTitanDAO Demo</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} initialChain={titan_goerli}>
                    <ChakraProvider theme={theme}>
                        <Container
                            display="flex"
                            flexDirection="column"
                            minHeight="100vh"
                            maxW="100%"
                            p={0}
                            backgroundColor="gray.50"
                        >
                            <HStack align="center" justify="space-between" p="2" width="100%">
                                <HStack>
                                    <Image src="/titan.png" alt="Titan Logo" boxSize="50px" />
                                    <Text fontSize="xl" fontWeight="bold">
                                        zkTitanDAO
                                    </Text>
                                </HStack>
                                <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
                                    <ConnectButton chainStatus="name" />
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

                            <HStack align="center" justify="flex-end" p="2">
                                <Link
                                    href={`https://explorer.titan-goerli.tokamak.network/address/${env.ZKTITANDAO_CONTRACT_ADDRESS}`}
                                    isExternal
                                    style={{
                                        border: "1px solid #8f9097",
                                        borderRadius: "4px",
                                        padding: "8px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "white"
                                    }}
                                >
                                    <Text fontWeight="bold">zkTitanDAO Explorer</Text>
                                </Link>
                            </HStack>

                            <HStack
                                flexBasis="56px"
                                borderTop="1px solid #8f9097"
                                backgroundColor="#83BAF7"
                                align="center"
                                justify="center"
                                spacing="4"
                                p="4"
                            >
                                {_logs.endsWith("...") && <Spinner color="primary.400" />}
                                <Text fontWeight="bold">{_logs || `Current step: ${router.route}`}</Text>
                            </HStack>
                        </Container>
                    </ChakraProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </>
    )
}
