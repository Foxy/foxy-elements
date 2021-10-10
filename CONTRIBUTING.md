# How to Contribute

_Elements is a UI library built by [Foxy](https://www.foxy.io/about-us). If you see someone on the team mention "Foxy Elements", "Elements", "foxy-elements", "@foxy.io/elements", "elements package" or "elements repo", they're most likely referring to this project. We hope this document makes the process for contributing clear and answers some questions that you may have._

## Code of Conduct

Foxy has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect project participants to adhere to it. Please read [the full text](CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on Elements happens directly on [GitHub](https://github.com/Foxy/foxy-elements). Both team members and external contributors send pull requests which go through the same review process. In the same time, Elements is **not** a community-driven project, so we will always prioritize our own needs and the needs of our customers when it comes to feature requests.

## Semantic Versioning

Elements follow [semantic versioning](https://semver.org/). We release patch versions for bug fixes, minor versions for backwards-compatible features, and major versions for any breaking changes. Significant changes may also appear in a pre-release before they become generally available. Release notes are available on [this page](https://github.com/Foxy/foxy-elements/releases).

## Branch Organization

We have two release branches: [main](https://github.com/Foxy/foxy-elements/tree/main) and [beta](https://github.com/Foxy/foxy-elements/tree/beta). Whenever someone commits changes to them, GitHub Workflows create a release and publish it to npm almost immediately. Only stable, tested and reviewed code is allowed on main. Unstable, untested or not yet reviewed code may appear on beta. If your code breaks the build or causes serious runtime errors, please keep it in a separate branch until it's ready.

## Bugs

We are using [GitHub Issues](https://github.com/Foxy/foxy-elements/issues) for our public bugs. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn’t already exist. If you've come across a security issue in this project, please consider [letting us know](https://www.foxy.io/security-contact) before opening a public issue.

## How to Get in Touch

You can find all the ways you can contact us on [this page](https://www.foxy.io/contact).

## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend filing an issue. This lets us reach an agreement on your proposal before you put significant effort into it.

If you’re only fixing a bug, it’s fine to submit a pull request right away but we still recommend to file an issue detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the issue.

## Your First Pull Request

Working on your first pull request? You can learn how from [this free video series](https://app.egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

If you decide to fix an issue, please be sure to check the comment thread and the list of assignees in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don’t accidentally duplicate your effort.

## Sending a Pull Request

The team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation. We might also decide to keep it open to make sure your changes align with the internal roadmap for other Foxy products. In any case, we’ll do our best to provide updates and feedback throughout the process.

Before submitting a pull request, please make sure the following is done:

0. If you don't have write access, fork [the repository](https://github.com/Foxy/foxy-elements).
1. Create your branch from `main`.
2. Run `npm install` in the repository root.
3. If you’ve fixed a bug or added code that should be tested, add tests.
4. If you’ve changed the public interface, run `npm run wca` and commit changes in `custom-elements.json`.
5. Ensure the test suite passes (`npm test`). Tip: `./node_modules/.bin/wtr TestPattern --watch` is helpful in development.
6. Run `npm run prepack` and `npm run build:storybook` to test that your code doesn't break the build.
7. Format your code with prettier (`npm run format`). Make sure your code lints.
8. If you haven’t already, complete the CLA.

## Contributor License Agreement (CLA)

In order to accept your pull request, we need you to submit a CLA. You only need to do this once, and a bot will send you a reminder in case you forget. [Complete your CLA here](https://cla-assistant.io/Foxy/foxy-elements).

## Tech We Use

Each UI component in this library is a custom element based on LitElement. Our design system is built on Vaadin 14 with a set of custom TailwindCSS utilities providing shortcuts for Lumo colors, fonts, sizing and spacing. Translations are handled through i18next. We use Web Dev Server with Storybook for development, Web Test Runner for testing, Rollup for CDN builds and a custom TypeScript compiler for npm releases. Code style is enforced with Prettier and ESLint, commit style is maintained with Commitizen. We develop using [Git](https://git-scm.com/), [Node](https://nodejs.org/) v14+ and [npm](https://github.com/npm/cli) v7+.

## Development Workflow

After cloning Elements, run `npm install` to fetch the dependencies. Then, you can run several commands:

- `npm run wca` regenerates `custom-elements.json` where all elements are documented.
- `npm run storybook` launches Storybook with Web Dev Server.
- `npm run storybook:build` builds Storybook with Rollup.
- `npm run lint` checks the code style with both ESLint and Prettier.
- `npm run lint:eslint` checks the code style with ESLint only.
- `npm run lint:prettier` checks the code style with Prettier only.
- `npm run format` fixes code style issues with both ESLint and Prettier.
- `npm run format:eslint` fixes code style issues with ESLint only.
- `npm run format:prettier` fixes code style issues with Prettier only.
- `npm run test` runs the complete test suite.
- `npm run test:watch` runs an interactive test watcher.
- `npm run test:playwright` runs tests in major browsers with Playwright (experimental).
- `npm run prepack` creates a `dist` folder for npm distribution.

## Style Guide

We use an automatic code formatter called [Prettier](https://prettier.io/). Run `npm run format:prettier` after making any changes to the code. Then, our linter will catch most issues that may exist in your code. You can check the status of your code styling by running `npm run lint:prettier`.

## License

By contributing to Elements, you agree that your contributions will be licensed under its [MIT license](LICENSE).

## Useful Links

- [Adding an Element](wiki/adding-an-element.md)
- [Codebase Overview](wiki/codebase-overview.md)
- [Mixins](wiki/mixins.md)
- [Mock Server](wiki/mock-server.md)
- [Foxy Elements Docs](https://elements.foxy.dev)
- [Foxy SDK Docs](https://sdk.foxy.dev)
