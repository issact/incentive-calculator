import type { Request, Response } from "express"
import * as reportService from "../services/report.service.js"
import { buildPaginationMeta, parseIncentiveListQuery } from "../utils/pagination.js"

export async function getIncentiveReport(req: Request, res: Response) {
    try {
        const query = parseIncentiveListQuery(req.query)
        const report = await reportService.getIncentiveReport(req.user!, query)

        res.json({
            data: report.data,
            pagination: buildPaginationMeta(query.page, query.limit, report.total)
        })
    } catch (err: any) {

        console.error(err)

        const status = err?.message?.startsWith("Invalid") || err?.message?.includes("fromDate must be")
            ? 400
            : 500
        res.status(status).json({ message: err.message })

    }
}

export async function getDashboardStats(req: Request, res: Response) {

    try {

        const stats = await reportService.getDashboardStats(req.user!.id)

        res.json(stats)

    } catch (err: any) {

        console.error(err)

        res.status(500).json({
            message: "Failed to fetch dashboard stats"
        })

    }

}
