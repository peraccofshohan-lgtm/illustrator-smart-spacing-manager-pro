# Testing — Illustrator Smart Spacing Manager Pro

## Automated unit tests (Node.js, mock Illustrator DOM)
26 tests covering:

- Unit conversion (pt/mm/cm/in/px)
- Bounds normalization, union, overlap
- Object gap engine (signed gap, overlap detection)
- Visual gap engine
- Measurement normalization and adjustment
- Rule engine CRUD, validation, conflicts
- Preset import/export (JSON, no eval)
- Text / style / name detection
- Section manager and relationship engine
- Spacing calculator and engine
- Preview engine and renderer
- Batch processor
- Safety: transactions, rollback, temporary objects
- Error reporter and logger

Run: `npm test` (26/26 passing).

## Mock Illustrator DOM
`tests/mocks/illustrator-mock.js` provides a minimal Document/Artboards/
PageItems/TextFrame/Selection mock. Mock results are **not** proof of
Illustrator compatibility.

## Static validation
- `npm run validate:es3` — rejects let/const/arrow/classes/templates/async/await/optional chaining/nullish coalescing/import/Promise/fetch/eval
- `npm run validate:build` — checks artifact non-empty and entry points present

## Build
`npm run build` produces a reproducible single-file JSX when
`SOURCE_DATE_EPOCH` is set; emits SHA-256 checksum.

## Manual testing (in actual Illustrator)
Planned but not yet executed for v0.1.0. Test plan covers 35 scenarios
(launch, palette, all panels, all detection methods, both measurement
engines, horizontal/vertical spacing, rules, preview, undo, rollback,
exclusions, multi-artboard, RGB/CMYK, Bengali/Unicode text, nested
groups, rotated/locked/hidden objects, large documents, cancellation,
preset reload). Results must be recorded in TESTING.md before a stable
release is claimed.
