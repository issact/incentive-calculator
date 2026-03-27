type QueryParamValue = string | number | boolean | null | undefined

export function buildQuery(params: Record<string, QueryParamValue>) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query.set(key, String(value))
        }
    })

    const q = query.toString();

    return q ? `?${q}` : ""
}
