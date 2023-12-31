import { Box, Button, Divider, Heading, HStack, Link, Text, useBoolean, VStack } from "@chakra-ui/react"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { BigNumber, utils } from "ethers"
import { useAccount, useNetwork } from "wagmi"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import IconRefreshLine from "../icons/IconRefreshLine"

export default function ProofsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, _groupId, addFeedback, refreshFeedbackFunc } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useBoolean()
    const [_identity, setIdentity] = useState<Identity>()
    const { address } = useAccount()
    const [prevAddress, setPrevAddress] = useState<string>("")
    const { chain } = useNetwork()

    useEffect(() => {
        if (!address) {
            setIdentity(undefined)
            router.push("/")
            return
        }

        if (!chain) {
            return
        }

        if (!prevAddress) {
            setPrevAddress(address?.toString())
            return
        }

        if (address.toString() !== prevAddress || chain.id !== 5050) {
            router.push("/")
        }
    }, [address, chain])

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            router.push("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback])

    const loadFeedback = useCallback(async () => {
        await refreshFeedbackFunc()
    }, [_feedback])

    const sendFeedback = async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            if (feedback.length > 32) {
                setLogs("🥲 Due to technical issues, feedback must be less than 32 characters.")
                return
            }

            setLoading.on()

            setLogs(`Posting your anonymous feedback...`)

            try {
                const group = new Group(_groupId, 20, _users)

                const signal = BigNumber.from(utils.formatBytes32String(feedback)).toString()

                const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, _groupId, signal)

                const response = await fetch("api/ZKTitanDAO", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        feedback: signal,
                        groupId: _groupId,
                        merkleTreeRoot,
                        nullifierHash,
                        proof
                    })
                })

                if (response.status === 200) {
                    addFeedback(feedback)

                    setLogs(`Your feedback was posted 🎉`)
                } else {
                    setLogs("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
            } finally {
                setLoading.off()
            }
        }
    }

    return (
        <>
            <Heading as="h2" size="xl">
                Proofs
            </Heading>

            <Text pt="2" fontSize="md">
                Semaphore members can anonymously{" "}
                <Link href="https://semaphore.pse.dev/docs/guides/proofs" color="primary.500" isExternal>
                    prove
                </Link>{" "}
                that they are part of a group and that they are generating their own signals. Signals could be anonymous
                votes, leaks, reviews, or feedback.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Feedback signals ({_feedback.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={loadFeedback}>
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
                    onClick={sendFeedback}
                    isDisabled={_loading}
                    leftIcon={<IconAddCircleFill />}
                >
                    Send Feedback
                </Button>
            </Box>

            {_feedback.length > 0 && (
                <VStack spacing="3" align="left">
                    {_feedback.map((f, i) => (
                        <HStack key={i} p="3" borderWidth={1} backgroundColor="white">
                            <Text>{f}</Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Divider pt="6" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => router.push("/groups")} />
        </>
    )
}
