import type { Prisma, UserRole } from "../generated/prisma/client"
import { hashPassword } from "../lib/auth"
import { prisma } from "../lib/prisma"

type CreateUserInput = Prisma.UserUncheckedCreateInput

const roleOrder: Record<UserRole, number> = {
    SALES: 1,
    TEAM_LEAD: 2,
    MANAGER: 3,
    OWNER_FINANCE: 4,
    ADMIN: 5,
}

function validateManagerHierarchy(
    userRole: UserRole,
    managerRole: UserRole
) {
    if (roleOrder[managerRole] !== roleOrder[userRole] + 1) {
        throw new Error("Invalid manager role")
    }
}

async function ensureNoCircularHierarchy(
    userId: string,
    managerId: string
) {
    let currentId: string | null = managerId

    while (currentId) {
        if (currentId === userId) {
            throw new Error("Circular reporting hierarchy detected")
        }

        const user = await prisma.user.findUnique({
            where: { id: currentId },
            select: { managerId: true }
        }) as { managerId: string | null } | null

        if (!user) break

        currentId = user.managerId
    }
}

export async function createUser(data: CreateUserInput) {
    const { name, email, password, role, managerId } = data

    if (!name || !email || !password || !role) {
        throw new Error("Missing required fields")
    }

    const passwordHash = await hashPassword(password)

    if (managerId) {
        const manager = await prisma.user.findUnique({
            where: { id: managerId }
        })

        if (!manager) {
            throw new Error("Manager not found")
        }

        validateManagerHierarchy(role, manager.role)
    }

    return prisma.user.create({
        data: {
            name,
            email,
            password: passwordHash,
            role,
            ...(managerId ? { managerId } : {})
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            isActive: true,
            createdAt: true
        }
    })
}

export async function updateUser(
    userId: string,
    data: {
        name?: string
        email?: string
        role?: UserRole
        managerId?: string | null
        isActive?: boolean
    }
) {

    if (data.managerId === userId) {
        throw new Error("User cannot be their own manager")
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        throw new Error("User not found")
    }

    const effectiveRole = data.role ?? user.role

    if (data.managerId) {

        await ensureNoCircularHierarchy(userId, data.managerId)

        const manager = await prisma.user.findUnique({
            where: { id: data.managerId }
        })

        if (!manager) {
            throw new Error("Manager not found")
        }

        validateManagerHierarchy(effectiveRole, manager.role)
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            ...data,
            ...(data.managerId === "" ? { managerId: null } : {})
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    })
}

export async function updateManager(userId: string, managerId: string) {

    if (managerId === userId) {
        throw new Error("User cannot be their own manager")
    }

    const [user, manager] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.user.findUnique({ where: { id: managerId } })
    ])

    if (!user || !manager) {
        throw new Error("User not found")
    }

    validateManagerHierarchy(user.role, manager.role)


    return prisma.user.update({
        where: { id: userId },
        data: { managerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    })
}

export async function getUsers() {
    return prisma.user.findMany({
        orderBy: {
            createdAt: "desc"
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    })
}

export async function deleteUser(userId: string) {

    const reports = await prisma.user.count({
        where: { managerId: userId }
    })

    if (reports > 0) {
        throw new Error("User manages other employees. Reassign them first.")
    }

    return prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
    })
}