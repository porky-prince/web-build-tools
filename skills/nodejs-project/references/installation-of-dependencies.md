# Installation of dependencies

Use this reference for the dependency installation part of Node.js project work.
It is one section of the broader `nodejs-project` skill, not the full scope of
the skill.

## Installation checklist

Follow this checklist before running a package manager command:

1. Detect the package manager from `packageManager`, lockfiles, and existing
   scripts. Use the existing manager unless the user explicitly asks otherwise.
2. Identify the package that needs the dependency. In workspaces, install into
   the narrowest package that imports or requires it.
3. Classify the dependency correctly:
   - Put runtime dependencies in `dependencies`.
   - Put test, build, lint, type, and tooling dependencies in
     `devDependencies`.
   - Put dependencies required by both runtime and development code only in
     `dependencies`; don't duplicate them in `devDependencies`.
4. Preserve existing version style when the project already has a clear
   convention.
5. If installation fails, report the exact failure and reason about the next
   step. Don't switch package managers or use unrelated flags without a clear
   reason.

## pnpm commands

Use these commands in pnpm projects.

```bash
pnpm install
pnpm add <package-name>
pnpm add <package-name>@<version>
pnpm add -D <package-name>
pnpm --filter <package-name> add <dependency>
pnpm --filter <package-name> add -D <dependency>
```

For workspace packages, prefer `pnpm --filter <package-name> ...` over adding
the dependency at the root unless the root package itself uses it.

## yarn commands

Use these commands in Yarn projects.

```bash
yarn install
yarn add <package-name>
yarn add <package-name>@<version>
yarn add -D <package-name>
yarn workspace <workspace-name> add <dependency>
yarn workspace <workspace-name> add -D <dependency>
```

When a project uses modern Yarn features, inspect the existing configuration
before adding flags or changing install behavior.

## npm commands

Use these commands in npm projects.

```bash
npm install
npm install <package-name>
npm install <package-name>@<version>
npm install -D <package-name>
npm install <dependency> --workspace=<workspace-name>
npm install -D <dependency> --workspace=<workspace-name>
```

Prefer the long `--workspace=<workspace-name>` form when it improves clarity in
workspace repositories.

## Global dependencies

Don't install global dependencies unless the user explicitly asks for a global
tool. Prefer project-local dependencies and package manager scripts so the
project remains reproducible.

## Manual package.json edits

Prefer package manager commands because they update both `package.json` and the
lockfile. Manual edits are acceptable when the task explicitly asks for a
metadata-only change or when installation cannot run in the current
environment. If you edit manually, explain that the lockfile may need to be
updated with the project's package manager.
