# Images2style Webpack Plugin Unit Test Plan

## Goals
Cover the plugin's core behavior: registering webpack hooks, triggering a pack,
and ensuring watch mode initializes only once. Keep tests stable by mocking
external dependencies instead of using real webpack or filesystem operations.

## Scope
Validate only this module's logic, not third-party behavior or exact output
formatting.

- `apply` hook registration and invocation.
- `images2style` call counts and `watch` flag transitions.
- "Run once" logic for watch mode.

## Dependencies and mocking strategy
- `images2style`: mock as a Promise-returning function to assert call counts and
  options.
- Webpack compiler: minimal stub that exposes `hooks.run.tapPromise` and
  `hooks.watchRun.tapPromise`.

## Tech stack
- Test framework: Jest (ts-jest)
- Language: TypeScript
- Mocks/assertions: Jest built-in mocks and assertion APIs

## Planned test cases
1. **Hook registration**
   - After `apply`, `hooks.run.tapPromise` and `hooks.watchRun.tapPromise` are
     registered.

2. **Run triggers pack**
   - Triggering the `run` hook calls `images2style` once.
   - Assert `watch` is forced to `false` during the run hook.

3. **WatchRun triggers once**
   - First `watchRun` call invokes `images2style` once and sets `watch` to
     `true`.
   - Subsequent `watchRun` calls do not invoke `images2style` again.

## Test file
- `packages/images2style-webpack-plugin/test/index.test.ts`

## Delivery checklist
- `pnpm --filter images2style-webpack-plugin test` passes.
- Coverage hits key branches in `src/index.ts`: run hook, watchRun hook, once
  guard.
