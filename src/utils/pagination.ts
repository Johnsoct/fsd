export function getOffset(limit: number, page: number): number {
    return (limit * page) - limit
}
