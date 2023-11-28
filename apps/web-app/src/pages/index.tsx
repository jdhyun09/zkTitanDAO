import { Box, Button, Divider, Heading, HStack, Link, ListItem, OrderedList, Text } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import { useAccount, useSignMessage } from "wagmi"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import IconAddCircleFill from "../icons/IconAddCircleFill"

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()
    const { signMessageAsync } = useSignMessage()
    const { address } = useAccount()
    const [prevAddress, setPrevAddress] = useState<string>("")

    useEffect(() => {
        if (!address) {
            return
        }

        if (address?.toString() !== prevAddress) {
            setIdentity(undefined)
            setPrevAddress(address?.toString())
        }
    }, [address])

    const createIdentity = useCallback(async () => {
        const signMessage = await signMessageAsync({
            message: "Hii this is for identity"
        })

        const identity = new Identity(signMessage)

        setIdentity(identity)

        localStorage.setItem("identity", identity.toString())

        setLogs("Your new Semaphore identity was just created 🎉")
    }, [])

    return (
        <>
            <Heading as="h2" size="xl">
                Identities
            </Heading>

            <Text pt="2" fontSize="md">
                Users interact with the protocol using a Semaphore{" "}
                <Link href="https://semaphore.pse.dev/docs/guides/identities" color="primary.500" isExternal>
                    identity
                </Link>{" "}
                (similar to Ethereum accounts). It contains three values:
            </Text>
            <OrderedList pl="20px" pt="5px" spacing="3">
                <ListItem>Trapdoor: private, known only by user</ListItem>
                <ListItem>Nullifier: private, known only by user</ListItem>
                <ListItem>Commitment: public</ListItem>
            </OrderedList>

            <Divider pt="5" borderColor="gray.500" />

            <HStack pt="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Identity
                </Text>
            </HStack>

            {_identity ? (
                <Box py="6" whiteSpace="nowrap">
                    <Box p="5" borderWidth={1} borderColor="gray.500" borderRadius="4px">
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Trapdoor: {_identity.trapdoor.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Nullifier: {_identity.nullifier.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Commitment: {_identity.commitment.toString()}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <Box py="6">
                    <Button
                        w="100%"
                        fontWeight="bold"
                        justifyContent="left"
                        colorScheme="primary"
                        px="4"
                        onClick={() => createIdentity()}
                        leftIcon={<IconAddCircleFill />}
                    >
                        Create identity
                    </Button>
                </Box>
            )}

            <Divider pt="3" borderColor="gray" />

            <Stepper step={1} onNextClick={_identity && (() => router.push("/groups"))} />
        </>
    )
}
