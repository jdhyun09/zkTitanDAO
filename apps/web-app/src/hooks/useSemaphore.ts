// import { SemaphoreEthers } from "@semaphore-protocol/data"
import { BigNumber, utils } from "ethers"
import { useCallback, useRef, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"
import getGroupMembers from "./getData/getGroupMembers"
import getGroupVerifiedProofs from "./getData/getGroupVerifiedProofs"

export default function useSemaphore(): SemaphoreContextType {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])
    const [_groupId, setGroupId] = useState<string>("0")
    const currentUsers = useRef<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const members = await getGroupMembers(_groupId)

        setUsers(members)
    }, [_groupId])

    const refreshUsersFunc = async (groupId: string): Promise<void> => {
        const members = await getGroupMembers(groupId)
        currentUsers.current = members
        setUsers(members)
    }

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const proofs = await getGroupVerifiedProofs(_groupId)

        setFeedback(proofs.map(({ signal }: any) => utils.parseBytes32String(BigNumber.from(signal).toHexString())))
    }, [_groupId])

    const refreshFeedbackFunc = async (): Promise<void> => {
        const proofs = await getGroupVerifiedProofs(_groupId)

        setFeedback(proofs.map(({ signal }: any) => utils.parseBytes32String(BigNumber.from(signal).toHexString())))
    }

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    return {
        _users,
        _feedback,
        _groupId,
        currentUsers,
        refreshUsers,
        refreshFeedback,
        addFeedback,
        setGroupId,
        refreshUsersFunc,
        refreshFeedbackFunc
    }
}
