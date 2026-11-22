# Testing — Illustrator Smart Spacing Manager Pro

## Automated unit tests (Node.js, mock Illustrator DOM)
64 tests covering:

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

Run: `npm test` (64/64 passing).

Test categories include:
- Unit: units, bounds, gap engines, measurement normalization, rules, detection,
  sections, spacing calculator/engine, preview, batch, safety, logging
- E2E: chapter detection→section→preview→apply, conflicting rules, rollback on
  partial failure, rollback failure reporting, Auto Detect (horizontal/vertical),
  Both Axes (X/Y movement, preview/apply equivalence), rule eligibility
  (section type, scope, direction, detection criteria, detection method,
  priority tie, COMBINED method), high-priority ineligible rule exclusion
- Regression: PositionManager Y-axis sign (downward/upward), 4-coordinate
  verification, read-only geometricBounds with translate-based rollback,
  missing captured position → restoration failure, SpacingEngine moveItemBy
  with read-only bounds, Auto Detect single-axis fallback (vertical/horizontal/
  neither-axis)
- Detection metadata: TextDetection → SectionManager → RuleEngine,
  StyleDetection → SectionManager → RuleEngine (actual matched criteria,
  not just count), NameDetection → SectionManager → RuleEngine,
  method-specific rule rejected when section has no detection method

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
