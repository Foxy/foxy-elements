/**
 * A product's description as DOM nodes. Descriptions are Markdown written
 * by the merchant, and untrusted on a storefront, so nothing here parses
 * HTML: raw tags are removed, every piece of text goes in as a text node,
 * and a link is kept only when it is `https`.
 *
 * Supports paragraphs, `#` headings, `-`/`*` and `1.` lists, pipe tables,
 * `**bold**`, `*italic*`, `` `code` `` and `[links](https://…)`.
 */
export function renderMarkdown(source: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lines = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .split(/\r?\n/);

  let index = 0;
  const take = (pattern: RegExp): string[] => {
    const taken: string[] = [];
    while (index < lines.length && pattern.test(lines[index])) taken.push(lines[index++]);
    return taken;
  };

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      // The page's own heading is the product's name, so these start at h2.
      const level = Math.max(2, heading[1].length);
      fragment.append(inline(document.createElement(`h${level}`), heading[2]));
      index++;
      continue;
    }

    if (TABLE_ROW.test(line) && TABLE_RULE.test(lines[index + 1] ?? "")) {
      const [head, , ...body] = take(TABLE_ROW);
      fragment.append(table(head, body));
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const pattern = BULLET.test(line) ? BULLET : NUMBERED;
      const list = document.createElement(pattern === BULLET ? "ul" : "ol");
      for (const item of take(pattern)) {
        list.append(inline(document.createElement("li"), item.replace(pattern, "")));
      }
      fragment.append(list);
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s/.test(lines[index]) &&
      !BULLET.test(lines[index]) &&
      !NUMBERED.test(lines[index])
    ) {
      paragraph.push(lines[index++].trim());
    }
    fragment.append(inline(document.createElement("p"), paragraph.join(" ")));
  }

  return fragment;
}

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+\.\s+/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_RULE = /^\s*\|[\s:|-]+\|\s*$/;

function cells(row: string): string[] {
  return row.trim().slice(1, -1).split("|").map((cell) => cell.trim());
}

function table(head: string, body: string[]): HTMLTableElement {
  const element = document.createElement("table");
  const row = (texts: string[], tag: "th" | "td") => {
    const tr = document.createElement("tr");
    for (const text of texts) tr.append(inline(document.createElement(tag), text));
    return tr;
  };
  element.createTHead().append(row(cells(head), "th"));
  const tbody = element.createTBody();
  for (const line of body) tbody.append(row(cells(line), "td"));
  return element;
}

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

function inline<T extends HTMLElement>(parent: T, text: string): T {
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    parent.append(text.slice(last, match.index));
    last = match.index + match[0].length;
    const [, bold, italic, code, label, href] = match;
    if (bold !== undefined) parent.append(wrap("strong", bold));
    else if (italic !== undefined) parent.append(wrap("em", italic));
    else if (code !== undefined) parent.append(wrap("code", code));
    else if (isHttps(href)) {
      const link = wrap("a", label) as HTMLAnchorElement;
      link.href = href;
      link.rel = "noopener nofollow";
      parent.append(link);
    } else parent.append(label);
  }
  parent.append(text.slice(last));
  return parent;
}

function wrap(tag: string, text: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

export function isHttps(url: string | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
