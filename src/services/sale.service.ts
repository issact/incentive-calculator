import { prisma } from "../lib/prisma"
import { generateIncentivesForSale } from "../lib/incentive.engine"
import { HttpError } from "../utils/errors.js"


export async function createSale(data: any, userId: string) {

    return prisma.$transaction(async (tx) => {

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

        return {
            ...sale,
            saleValue: Number(sale.saleValue)
        }
    })
}
