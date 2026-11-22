# Contributing

## Code style
- ES3-compatible JavaScript only: `var`, function declarations, no
  `let`/`const`, arrow functions, classes, template literals,
  async/await, optional chaining, nullish coalescing, destructuring,
  or `eval`.
- Modules live under `src/` and are concatenated by `build/build.js`
  in a deterministic order.
- Comment every module; avoid magic numbers (use `src/Core/Constants.jsx`).

## Workflow
1. Branch from `main`.
2. Implement and unit-test (`npm test`).
3. Run build (`npm run build`), ES3 validation, and build validation.
4. Open a pull request; keep `main` stable.

## Release
- Semantic versioning; prereleases (e.g. v0.1.0) acceptable before live
  Illustrator validation.
- Build artifact: `dist/Illustrator_Smart_Spacing_Manager_Pro.jsx` plus
  SHA-256 checksum.
- GitHub Release with attached JSX and documentation.
