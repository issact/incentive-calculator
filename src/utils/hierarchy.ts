import { prisma } from "../lib/prisma.js"

export async function getManagerChain(userId: string) {

    const chain: { id: string }[] = []

    let current = await prisma.user.findUnique({
        where: { id: userId }
    })

    while (current?.managerId) {

        const manager = await prisma.user.findUnique({
            where: { id: current.managerId }
        })

        if (!manager) break

        chain.push(manager)

        current = manager
    }

    return chain
}