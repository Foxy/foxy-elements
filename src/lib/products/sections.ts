/** One part of a description: a top-level heading's text and what follows it. */
export interface Section {
  label: string;
  nodes: Node[];
}

/**
 * Splits a rendered description at its top-level headings, the highest
 * level it uses. `intro` is what comes before the first of them.
 */
export function splitSections(fragment: DocumentFragment): { intro: Node[]; sections: Section[] } {
  const nodes = [...fragment.childNodes];
  const levels = nodes
    .map((node) => (node instanceof HTMLElement ? /^H([2-6])$/.exec(node.tagName)?.[1] : undefined))
    .filter((level): level is string => level !== undefined);
  if (!levels.length) return { intro: nodes, sections: [] };

  const top = `H${Math.min(...levels.map(Number))}`;
  const intro: Node[] = [];
  const sections: Section[] = [];
  for (const node of nodes) {
    if (node instanceof HTMLElement && node.tagName === top) {
      sections.push({ label: node.textContent?.trim() ?? "", nodes: [] });
    } else {
      (sections.at(-1)?.nodes ?? intro).push(node);
    }
  }
  return { intro, sections };
}

let instances = 0;

/**
 * Sections as tabs: a tab list with roving focus (arrow keys, Home, End)
 * and a panel for each, all kept in the page. A panel that isn't shown is
 * `hidden="until-found"`, so the browser's find still reaches its text and
 * shows it.
 */
export function tabs(sections: Section[], selected: number, onSelect: (index: number) => void): HTMLElement {
  const id = `foxy-product-sections-${++instances}`;
  const root = document.createElement("div");
  root.className = "foxy-product-sections";
  root.dataset.layout = "tabs";
  const list = document.createElement("div");
  list.className = "foxy-product-tablist";
  list.setAttribute("role", "tablist");

  const buttons: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];
  const select = (index: number, focus: boolean): void => {
    buttons.forEach((button, at) => {
      button.setAttribute("aria-selected", String(at === index));
      button.tabIndex = at === index ? 0 : -1;
    });
    panels.forEach((panel, at) => {
      if (at === index) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    });
    if (focus) buttons[index].focus();
    onSelect(index);
  };

  sections.forEach((section, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "foxy-product-tab";
    button.id = `${id}-tab-${index}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `${id}-panel-${index}`);
    button.textContent = section.label;
    button.addEventListener("click", () => select(index, false));
    buttons.push(button);

    const panel = document.createElement("div");
    panel.className = "foxy-product-panel";
    panel.id = `${id}-panel-${index}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", button.id);
    panel.tabIndex = 0;
    panel.append(...section.nodes);
    // Find in page shows a hidden panel's text; its tab follows.
    panel.addEventListener("beforematch", () => select(index, false));
    panels.push(panel);
  });

  list.addEventListener("keydown", (event) => {
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    const last = buttons.length - 1;
    const next =
      event.key === "ArrowRight" ? (current === last ? 0 : current + 1)
      : event.key === "ArrowLeft" ? (current === 0 ? last : current - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (next < 0) return;
    event.preventDefault();
    select(next, true);
  });

  list.append(...buttons);
  root.append(list, ...panels);
  select(Math.min(selected, sections.length - 1), false);
  return root;
}

/** Sections as native disclosures, the selected one open. */
export function accordion(sections: Section[], selected: number, onSelect: (index: number) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "foxy-product-sections";
  root.dataset.layout = "accordion";
  sections.forEach((section, index) => {
    const details = document.createElement("details");
    details.className = "foxy-product-section";
    details.open = index === selected;
    const summary = document.createElement("summary");
    const title = document.createElement("h2");
    title.className = "foxy-product-section-title";
    title.textContent = section.label;
    summary.append(title);
    const body = document.createElement("div");
    body.className = "foxy-product-panel";
    body.append(...section.nodes);
    details.append(summary, body);
    details.addEventListener("toggle", () => {
      if (details.open) onSelect(index);
    });
    root.append(details);
  });
  return root;
}
