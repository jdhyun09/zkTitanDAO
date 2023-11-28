import React from "react"

export type SemaphoreContextType = {
    _users: string[]
    _feedback: string[]
    _groupId: string
    refreshUsers: () => Promise<void>
    addUser: (user: string) => void
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
    refreshUsers: () => Promise.resolve(),
    addUser: () => {},
    refreshFeedback: () => Promise.resolve(),
    addFeedback: () => {},
    setGroupId: () => {},
    refreshUsersFunc: () => Promise.resolve(),
    refreshFeedbackFunc: () => Promise.resolve()
})
