export type Link = { href: string; title: string; templated: boolean };
export type Data = { _links: Record<PropertyKey, Link> & { self: Link } };
