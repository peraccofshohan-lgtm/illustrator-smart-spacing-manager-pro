# Changelog

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
