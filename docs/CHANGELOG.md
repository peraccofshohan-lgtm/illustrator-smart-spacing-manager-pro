# Changelog

## [0.1.1] — 2026-11-21 (corrective prerelease)

### Fixed
- **Bounds normalization (critical)**: Illustrator `geometricBounds = [left, top, right, bottom]` where top > bottom. Vertical gap = upper.bottom − lower.top. Previous normalization reversed vertical semantics, producing incorrect gap calculations.
- **Object gap engine**: Corrected gap formula and added tests for positive/zero/negative gaps, overlap, different dimensions, horizontal gap.
- **Visual gap engine**: Properly captures and uses the return value of `createOutline()` on the duplicated text frame. Marks text-frame measurements as approximate.
- **Rule engine**: Added `resolveRuleForSection()` for deterministic rule selection by section type, detection method, scope, direction, measurement mode, and priority. Removed first-enabled-rule shortcut.
- **Conflict resolver**: Added pairwise conflict detection for conflicting target gaps, anchor behaviors, and measurement modes.
- **Preview/Apply consistency**: Preview entries preserve the resolved rule ID, measurement mode, bounds type, direction, unit, and anchor behavior. Apply uses the same resolved rule and re-measures with the same method.
- **Measurement directions**: Vertical, Horizontal, Both Axes, and Auto Detect are all implemented in UI, preview, and apply paths.
- **Safety/rollback**: TransactionManager, PositionManager, and RollbackManager integrated into SpacingEngine.applyToSections. Positions are captured before modification; partial operations roll back on failure.
- **Detection UI**: Style Matching now has real criteria controls (font family, font style, font size, character style, fill color) instead of a placeholder pattern field.
- **Module load order**: PositionManager, TemporaryObjectManager, TransactionManager, RollbackManager load before SpacingEngine.
- **Test suite**: All 29 tests (including 3 end-to-end integration tests) use correct Illustrator coordinate semantics and pass.
- **GitHub Actions**: Added package-lock.json; removed `|| true` from validation commands; ES3/build validation and asset upload failures now fail the workflow; release asset verification via API.

### Added
- End-to-end integration tests: chapter heading detection, section creation, preview/apply gap verification, conflicting rule detection, rollback on failure.
- Release asset verification step in CI workflow.

## [0.1.0] — 2026-11-21 (prerelease)
- Initial implementation of Illustrator Smart Spacing Manager Pro.
- Single-file ExtendScript JSX build, ES3-validated, reproducible.
- Core modules: constants, compatibility (safe JSON, no eval), utilities,
  document manager, state manager, logging, error reporting.
- Measurement: bounds manager, object gap engine, visual gap engine
  (duplicate + outline), normalizer, reliability.
- Detection: manual, text, style, name, combined (deduplicated), registry.
- Sections: manager, relationship engine.
- Rules: engine, validator, conflict resolver, preset manager with
  7 built-in presets.
- Spacing: calculator, engine, position manager.
- Preview: engine, renderer with temporary indicators and cleanup.
- Batch processor across scopes.
- Safety: temporary object manager, transaction manager, rollback manager.
- UI: floating ScriptUI palette with 10 tabs (Dashboard, Detection,
  Sections, Measurement, Rules, Presets, Preview, Batch, Settings, Help).
- 26 automated unit tests (Node.js + mock DOM), all passing.
- Build script, ES3 validation, build validation, release packaging.
- Documentation: PRD, architecture, user guide, installation, testing,
  compatibility, known limitations.

## [Unreleased]
- Live Adobe Illustrator validation (required before v1.0.0).
- GitHub Release with v0.1.0 asset and checksum verification.
