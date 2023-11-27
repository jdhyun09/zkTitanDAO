import { Identity } from "@semaphore-protocol/identity"

function checkParameter(value: any, name: string, type: string) {
    if (value === undefined) {
        throw new TypeError(`Parameter '${name}' is not defined`)
    }

    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not a ${type}`)
    }
}

export default async function createSignedIdentity(
    sign: (message: string) => Promise<string>,
    groupId: string,
    nonce = 0
): Promise<Identity> {
    checkParameter(sign, "sign", "function")
    checkParameter(groupId, "groupId", "string")
    checkParameter(nonce, "nonce", "number")

    const message = await sign(
        `Sign this message to generate your ${groupId} Semaphore identity with key nonce: ${nonce}.`
    )

    return new Identity(message)
}
