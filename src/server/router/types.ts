export type Document = Record<string, unknown> & { id: number };
export type Defaults = Record<string, (query: URLSearchParams, dataset: Dataset) => Document>;
export type Dataset = Record<string, Document[]>;
export type Links = Record<string, (document: Document) => Record<string, { href: string }>>;
