# Codebase Overview

This section will give you an overview of the Elements codebase organization, its conventions, and the implementation.

## Top-Level

- [.build](../.build) - custom TypeScript compiler and bundler plugins.
- [.github](../.github) - GitHub Workflows for PRs and releases.
- [.storybook](../.storybook) - Storybook configuration.

## Source (`/src`)

- [elements](../src/elements) - all custom elements in the library.
  - [internal](../src/elements/internal) - custom elements for internal use in global registry, grouped by class name.
  - [private](../src/elements/private) - custom elements for internal use in scoped registries, grouped by class name.
  - [public](../src/elements/public) - custom elements for public use, grouped by class name.
- [events](../src/events) - common events (deprecated).
- [global](../src/global) - JS globals (deprecated).
- [mixins](../src/mixins) - various [mixins](./mixins.md) for internal use.
- [mocks](../src/mocks) - hAPI and i18next data for testing (deprecated).
- [server](../src/server) - [mock server](./mock-server.md) for demo and test purposes.
- [static](../src/static) - static files like images and translations.
- [storygen](../src/storygen) - story generation utilities for Storybook.
- [testgen](../src/testgen) - various test helpers.
- [types](../src/types) - common type definitions and augmentations for packages without type info.
- [utils](../src/utils) - shared utilities.
- [env.ts](../src/env.ts) - `process.env` config (deprecated).
- [index.defined.ts](../src/index.defined.ts) - library export that defines custom elements on import.
- [index.ts](../src/index.ts) - main library export (bare element classes).

## Translations (`/src/static/translations`)

- [admin](../src/static/translations/admin) - i18n files for the Foxy Admin (deprecated).
- [global](../src/static/translations/global) - common translations for pre-Nucleon elements (deprecated).
- [region](../src/static/translations/region) - localized region names (deprecated).
- [country](../src/static/translations/country) - localized country names (deprecated).
- other – translations specific to a particular element (e.g. `customer-portal` will hold i18n files for `foxy-customer-portal` element); see schemas [here](../src/static/schemas).
