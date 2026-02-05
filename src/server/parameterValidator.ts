export function parameterValidator(query: {
    seed?: unknown;
    page?: unknown;
    locale?: unknown;
    likes?: unknown;
    limit?: unknown;
}) {
    return {
        seed: (query.seed as string) || 'default',
        page: parseInt(query.page as string) || 1,
        locale: (query.locale as string) || 'en_US',
        likes: parseFloat(query.likes as string) || 0,
        limit: Math.max(1, Math.min(100, Number(query.limit as string) || 20)),
    };
}
