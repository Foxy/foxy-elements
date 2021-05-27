export function getPagination(url: string): { limit: number; offset: number } {
  const limitInQuery = parseInt(new URL(url).searchParams.get('limit') ?? '');
  const limit = isNaN(limitInQuery) || limitInQuery > 300 || limitInQuery < 0 ? 20 : limitInQuery;

  const offsetInQuery = parseInt(new URL(url).searchParams.get('offset') ?? '');
  const offset = isNaN(offsetInQuery) || offsetInQuery < 0 ? 0 : offsetInQuery;

  return { limit, offset };
}
