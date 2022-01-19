export type Document = Record<string, unknown>;
export type Defaults = Record<string, (query: URLSearchParams) => Document>;
export type Dataset = Record<string, Document[]>;
export type Links = Record<string, (document: Document) => Record<string, { href: string }>>;
