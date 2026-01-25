# Images2atlas Webpack Plugin Unit Test Plan

## Goals
- Cover the plugin’s core behavior: registering webpack hooks, triggering pack,
  and ensuring watch mode initializes only once.
- Keep tests stable by mocking external dependencies instead of using real
  webpack or filesystem operations.

## Scope
- `apply` hook registration and invocation.
- `images2atlas` call counts and `watch` flag transitions.
- “Run once” logic for watch mode.
- Validate only this module’s logic; do not verify third-party behavior or
  parameter details.

## Dependencies and Mocking Strategy
- `images2atlas`: mock as a Promise-returning function to assert call counts and
  options.
- Webpack compiler: minimal stub that exposes `hooks.run.tapPromise` and
  `hooks.watchRun.tapPromise`.

## Tech Stack
- Test framework: Jest (ts-jest)
- Language: TypeScript
- Mocks/assertions: Jest built-in mocks and assertion APIs

## Planned Test Cases
1. **Hook registration**
   - After `apply`, `hooks.run.tapPromise` and `hooks.watchRun.tapPromise` are
     registered.

2. **Run triggers pack**
   - Triggering the `run` hook calls `images2atlas` once.
   - Assert `watch` is forced to `false` during the run hook.

3. **WatchRun triggers once**
   - First `watchRun` call invokes `images2atlas` once and sets `watch` to `true`.
   - Subsequent `watchRun` calls do not invoke `images2atlas` again.

## Test File
- Replace `packages/images2atlas-webpack-plugin/test/index.test.ts`.

## Delivery Checklist
- Jest passes (at minimum `pnpm --filter images2atlas-webpack-plugin test`).
- Coverage hits key branches in `src/index.ts`: run hook, watchRun hook, once
  guard.
