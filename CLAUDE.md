# Project Guidelines

## Maintain This File

- Update this file only when you discover stable, repo-specific conventions or development-process details that are not obvious from the codebase or standard tooling.
- Keep it minimal: prefer the smallest useful note, skip obvious/framework-default guidance, and do not add task-specific or temporary findings.

## Elements

- Custom elements live in `src/elements/<tag-name>/`.
- Every element directory needs `index.ts`; Vite auto-discovers each directory under `src/elements/` and builds `<dir>/index.ts` as an entrypoint.
- The main implementation lives in `element.ts` or `element.tsx` and self-registers the tag with a guarded `customElements.define(...)` call.
- Keep element docs, stories, and tests beside the implementation: `docs.mdx`, `element.stories.ts`, and `element.test.ts`.
- Add folder-local helpers only when needed (`utils.ts`, `types.ts`, `events.ts`, `view.tsx`, `stripe/`, etc.).

## Adding Elements

- Create `src/elements/foxy-new-element/`, add `index.ts`, and export the folder from `src/elements/index.ts`.
- Add a manual package export in `package.json` for `./foxy-new-element -> ./dist/npm/foxy-new-element.js`. Source entries are auto-discovered; package exports are not.
- Add JSX typings in `src/types/custom-elements.d.ts`. Mirror both camelCase property names and dashed attribute names.
- If an element composes other custom elements, import their implementation modules from the parent module so they self-register before use.
- Use the `@/` alias for imports from `src/*`.

## UI System

- Use `@foxy.io/design-system` (Base UI + styled-components) as the shared UI layer. Import components from their per-component subpaths, e.g. `@foxy.io/design-system/field` (compound: `Field.Root`, `Field.Label`, …), `@foxy.io/design-system/button`. There is no `/ui/*` namespace and no shipped `styles.css`. Do not add local `src/components/ui` copies.
- Style with `styled-components`, reading tokens via `props.theme.tokens.*`; wrap React roots in `ThemeProvider theme={{ tokens: defaultTheme }}` (from `@foxy.io/design-system/theme`).
- `styled-components`, `@foxy.io/design-system`, and `@foxy.io/sdk` are externalized from the build (see `vite.config.ts` externals). Keep `styled-components` externalized — bundling it gives elements its own instance, so DS components elements renders can't see the consumer's `ThemeProvider` (theme becomes undefined).

## API Conventions

- Public element APIs are dual-surfaced: dashed HTML attributes map to camelCase properties, while native `HTMLElement` names like `lang` stay unchanged.
- If a property reflects to an attribute, preserve synchronous reflection even while disconnected; existing tests rely on that behavior.
- If you add user-facing strings, refresh `src/locales/en-US.json` with `npm run extract`.
