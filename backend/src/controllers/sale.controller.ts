import type { Request, Response } from "express"
import * as saleService from "../services/sale.service.js"
import { createSaleSchema, voidSaleSchema } from "../validations/sale.validation.js"
import { buildPaginationMeta, parseSaleListQuery } from "../utils/pagination.js"
import { sendError } from "../utils/errors.js"

export async function createSale(req: Request, res: Response) {
    try {
        const parsed = createSaleSchema.parse(req.body)

        const sale = await saleService.createSale(parsed, req.user!.id)
        res.json(sale)
    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to create sale" })
    }
}

export async function listSales(req: Request, res: Response) {
    try {
        const query = parseSaleListQuery(req.query)
        const result = await saleService.listSales(req.user!, query)

        res.json({
            data: result.data,
            pagination: buildPaginationMeta(query.page, query.limit, result.total)
        })
    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to fetch sales" })
    }
}

export async function getSaleById(req: Request<{ id: string }>, res: Response) {
    try {
        const sale = await saleService.getSaleById(req.user!, req.params.id)
        res.json(sale)
    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to fetch sale" })
    }
}

export async function voidSale(req: Request<{ id: string }>, res: Response) {
    try {
        const parsed = voidSaleSchema.parse(req.body)
        const sale = await saleService.voidSale(req.params.id, req.user!.id, parsed.reason)
        res.json(sale)
    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to void sale" })
    }
}
