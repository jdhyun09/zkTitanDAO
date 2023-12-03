import React, { MutableRefObject } from "react"

export type SemaphoreContextType = {
    _users: string[]
    _feedback: string[]
    _groupId: string
    currentUsers: MutableRefObject<string[]>
    refreshUsers: () => Promise<void>
    refreshFeedback: () => Promise<void>
    addFeedback: (feedback: string) => void
    setGroupId: (groupId: string) => void
    refreshUsersFunc: (groupId: string) => Promise<void>
    refreshFeedbackFunc: () => Promise<void>
}

export default React.createContext<SemaphoreContextType>({
    _users: [],
    _feedback: [],
    _groupId: "",
    currentUsers: {current: []},
    refreshUsers: () => Promise.resolve(),
    refreshFeedback: () => Promise.resolve(),
    addFeedback: () => {},
    setGroupId: () => {},
    refreshUsersFunc: () => Promise.resolve(),
    refreshFeedbackFunc: () => Promise.resolve()
})
