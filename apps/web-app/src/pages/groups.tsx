import { Box, Button, Divider, Heading, HStack, Link, Text, useBoolean, VStack } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useAccount } from "wagmi"
import getNextConfig from "next/config"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import eligibleCheck from "../hooks/eligibleCheck"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import IconRefreshLine from "../icons/IconRefreshLine"

const { publicRuntimeConfig: env } = getNextConfig()

export default function GroupsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, _groupId, refreshUsers, addUser, setGroupId, refreshUsersFunc } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useBoolean()
    const [_identity, setIdentity] = useState<Identity>()
    const { address } = useAccount()
    const [prevAddress, setPrevAddress] = useState<string>("")

    useEffect(() => {
        if (!address) {
            return
        }

        if (!prevAddress) {
            setPrevAddress(address?.toString())
            return
        }

        if (address.toString() !== prevAddress) {
            router.push("/")
        }
    }, [address])

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            router.push("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        let groupName
        switch (_groupId) {
            case "0":
                groupName = "AnyOne"
                break
            case "1":
                groupName = "Ton holders"
                break
            case "2":
                groupName = "Titan NFT"
                break
            default:
                groupName = "??"
        }

        if (_users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the ${groupName} group 🤙🏽`)
        }
    }, [_users, _groupId])

    const userHasJoined = (identity: Identity) => _users.includes(identity.commitment.toString())

    const joinGroup = async (groupName: string, id: string) => {
        if (!_identity) {
            return
        }

        setLoading.on()
        setLogs(`Joining the ${groupName} group...`)

        setGroupId(id)

        await refreshUsersFunc(id)

        const status = await eligibleCheck(id, prevAddress)
        console.log(status)

        if (!status) {
            setLogs(`You are ineligible to join the ${groupName} group`)

            setLoading.off()
            return
        }

        if (!userHasJoined(_identity) && status) {
            const response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString(),
                    groupId: id
                })
            })

            if (response.status === 200) {
                addUser(_identity.commitment.toString())

                setLogs(`You joined the ${groupName} group Successfully! Share your feedback anonymously🥷`)
            } else {
                setLogs("Some error occurred, please try again!")
            }
        }

        setLoading.off()
    }

    return (
        <>
            <Heading as="h2" size="xl">
                Groups
            </Heading>

            <Text pt="2" fontSize="md">
                Semaphore{" "}
                <Link href="https://semaphore.pse.dev/docs/guides/groups" color="primary.500" isExternal>
                    groups
                </Link>{" "}
                are binary incremental Merkle trees in which each leaf contains an identity commitment for a user.
                Groups can be abstracted to represent events, polls, or organizations.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Feedback users ({_users.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={refreshUsers}>
                    Refresh
                </Button>
            </HStack>

            <Box pb="5">
                <Button
                    w="100%"
                    fontWeight="bold"
                    justifyContent="left"
                    colorScheme="primary"
                    px="4"
                    onClick={() => joinGroup("Anyone", "0")}
                    isDisabled={_loading || !_identity}
                    leftIcon={<IconAddCircleFill />}
                >
                    Join Anyone Group
                </Button>
            </Box>
            <Box pb="5">
                <Button
                    w="100%"
                    fontWeight="bold"
                    justifyContent="left"
                    colorScheme="primary"
                    px="4"
                    onClick={() => joinGroup("Ton holders", "1")}
                    isDisabled={_loading || !_identity}
                    leftIcon={<IconAddCircleFill />}
                >
                    Join Ton holders Group
                </Button>
            </Box>
            <Box pb="5">
                <Button
                    w="100%"
                    fontWeight="bold"
                    justifyContent="left"
                    colorScheme="primary"
                    px="4"
                    onClick={() => joinGroup("Titan NFT", "2")}
                    isDisabled={_loading || !_identity}
                    leftIcon={<IconAddCircleFill />}
                >
                    Join Titan NFT Group
                </Button>
            </Box>

            {_users.length > 0 && (
                <VStack spacing="3" px="3" align="left" maxHeight="300px" overflowY="scroll">
                    {_users.map((user, i) => (
                        <HStack key={i} p="3" borderWidth={1} whiteSpace="nowrap">
                            <Text textOverflow="ellipsis" overflow="hidden">
                                {user}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Divider pt="6" borderColor="gray" />

            <Stepper
                step={2}
                onPrevClick={() => router.push("/")}
                onNextClick={_identity && userHasJoined(_identity) ? () => router.push("/proofs") : undefined}
            />
        </>
    )
}
