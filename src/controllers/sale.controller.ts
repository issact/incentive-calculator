import type { Request, Response } from "express"
import * as saleService from "../services/sale.service.js"
import { createSaleSchema } from "../validations/sale.validation.js"

export async function createSale(req: Request, res: Response) {
    try {
        const parsed = createSaleSchema.parse(req.body)

        const sale = await saleService.createSale(parsed, req.user!.id)
        res.json(sale)
    } catch (err: any) {
        console.error(err)

        res.status(500).json({
            message: err.message || "Failed to create sale"
        })
    }
}