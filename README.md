[![node][node-badge]][node-url]
[![pnpm][pnpm-badge]][pnpm-url]

# web-build-tools

web-build-tools is a pnpm workspace monorepo for web build tools.

## Packages

This repo publishes several packages that work together or independently. Each
package links to its README for details:

- [`images2atlas`](packages/images2atlas/README.md): Core module that generates
  spritesheets from image directories and outputs SASS/LESS/Stylus mixins.
- [`images2atlas-webpack-plugin`](packages/images2atlas-webpack-plugin/README.md):
  Webpack plugin wrapper for `images2atlas`.
- [`images2style`](packages/images2style/README.md): Core module that generates
  CSS background styles for images.
- [`images2style-webpack-plugin`](packages/images2style-webpack-plugin/README.md):
  Webpack plugin wrapper for `images2style`.
- [`web-build-utils`](packages/web-build-utils/README.md): Shared utilities
  used by the other packages.

## Scripts

Run these scripts from the repo root with pnpm:

- `pnpm lint`: Run ESLint and Prettier checks in parallel.
- `pnpm test`: Run Jest across all workspace packages.
- `pnpm build`: Build all packages with TypeScript declarations.
- `pnpm pub:changeset`: Create a Changeset for versioning.
- `pnpm pub:alpha`: Enter the Changesets prerelease mode for alpha versions.
- `pnpm pub:beta`: Enter the Changesets prerelease mode for beta versions.
- `pnpm pub:rc`: Enter the Changesets prerelease mode for release candidates.
- `pnpm pub:exit-pre`: Exit the Changesets prerelease mode.
- `pnpm pub:version`: Apply version updates from Changesets.
- `pnpm pub:release`: Publish versions to the npm registry.

## Release workflow

This repo uses a GitHub Actions workflow to create version bump pull requests
and publish packages after merge. The workflow runs on pushes to `main` and
splits into two paths based on the commit message.

1. Add Changesets in feature branches and merge them into `main`.
2. On `main`, the workflow opens a release pull request that updates package
   versions and changelogs.
3. Merge the release pull request back into `main`.
4. The workflow builds all packages and runs `pnpm pub:release` to publish to
   npm, then pushes Git tags.

## License

[`MIT`](LICENSE)

[node-badge]: https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=node.js&logoColor=white
[node-url]: https://nodejs.org
[pnpm-badge]: https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io
