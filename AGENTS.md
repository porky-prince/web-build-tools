# Repository Guidelines

## Project Structure & Module Organization
This is a pnpm workspace monorepo. Packages live under `packages/`:
- `packages/web-build-utils`: shared utilities used by the plugins.
- `packages/images2atlas-webpack-plugin`: spritesheet generator plugin.
- `packages/images2style-webpack-plugin`: CSS background generator plugin.
Each package follows `src/` for TypeScript sources, `test/` for Jest tests, and `dist/` as build output. Shared tooling lives at the repo root (`eslint.config.js`, `prettier.config.js`, `jest.config.js`, `commitlint.config.js`).

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies (Node >=22, pnpm >=9).
- `pnpm build`: builds every package (`tsc --declaration` into `dist/`).
- `pnpm test`: runs Jest in every package via workspace filters.
- `pnpm lint`: runs ESLint + Prettier checks in parallel.
- `pnpm --filter images2atlas-webpack-plugin test`: run a single package test.
- `pnpm pub:changeset`: create a changeset for versioning; release flow uses `pnpm pub:version` and `pnpm pub:release`.

## Coding Style & Naming Conventions
Use 2-space indentation and LF endings (`.editorconfig`). Prettier enforces `singleQuote`, `semi: true`, `trailingComma: 'es5'`, and `printWidth: 80`. ESLint uses the recommended JS + TypeScript rules plus Prettier integration. Prefer TypeScript for source files (`src/*.ts`) and keep entry points named `index.ts`.

## Testing Guidelines
Tests use Jest with `ts-jest`. Place tests under `packages/*/test` and name files `*.test.ts` or `*.test.js`. Coverage is collected from `src/` files. Run `pnpm test` for the full suite or filter by package.

## Commit & Pull Request Guidelines
Commit messages must follow Conventional Commits (`feat: ...`, `fix: ...`) enforced by commitlint/husky. PRs should include a concise summary, testing notes, and a changeset when modifying published packages. Link related issues if applicable.

## Release & Changesets
This repo uses Changesets (`.changeset/`) to manage versions and changelogs. Add a changeset for user-facing changes and use the `pub:*` scripts for pre-release or publish workflows.
