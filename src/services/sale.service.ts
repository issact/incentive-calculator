import { prisma } from "../lib/prisma"
import { generateIncentivesForSale } from "../lib/incentive.engine"
import { HttpError } from "../utils/errors.js"
import { notifyReviewersIncentivesCreatedForSale } from "./notification.service.js"


export async function createSale(data: any, userId: string) {

    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { managerId: true },
        })

        if (!user) throw HttpError.notFound("User not found", { code: "USER_NOT_FOUND" })
        if (!user.managerId) throw HttpError.badRequest("User has no manager assigned", { code: "MANAGER_NOT_ASSIGNED" })


        const existingSale = await tx.sale.findUnique({
            where: { saleCode: data.saleCode }
        })

        if (existingSale) {
            throw HttpError.conflict("Sale with this saleCode already exists", { code: "SALE_CODE_EXISTS" })
        }

        const sale = await tx.sale.create({
            data: {
                ...data,

                saleDate: new Date(data.saleDate),

                bookingDate: data.bookingDate
                    ? new Date(data.bookingDate)
                    : undefined,

                closeDate: data.closeDate
                    ? new Date(data.closeDate)
                    : undefined,

                createdById: userId
            }
        })

        await generateIncentivesForSale(tx, sale.id)

        return sale
    })

    // Best-effort notification: do not affect core flow.
    void notifyReviewersIncentivesCreatedForSale(result.id)

    return {
        ...result,
        saleValue: Number(result.saleValue)
    }
}
