# Architecture — Illustrator Smart Spacing Manager Pro

## Source layout (`src/`)
45 ES3-compatible modules grouped by responsibility:

- `Core/Constants.jsx` — version, units, defaults, namespace init
- `Core/Compatibility.jsx` — ES3 helpers, safe JSON parse/stringify (no eval)
- `Core/Utilities.jsx` — unit conversion, formatting, cloning
- `Core/DocumentManager.jsx` — Illustrator document/artboard/item access
- `Core/StateManager.jsx` — application state container
- `Diagnostics/Logger.jsx` — diagnostic logging
- `Diagnostics/ErrorReporter.jsx` — structured error reporting
- `Measurement/BoundsManager.jsx` — bounds normalization, union/intersection/overlap
- `Measurement/ObjectGapEngine.jsx` — object-to-object vertical/horizontal gap
- `Measurement/VisualGapEngine.jsx` — visual gap via duplicate + outline
- `Measurement/MeasurementNormalizer.jsx` — unit conversion for measurements
- `Measurement/MeasurementReliability.jsx` — reliability scoring/warnings
- `Detection/ManualDetection.jsx` — selection-based detection
- `Detection/TextDetection.jsx` — text content matching
- `Detection/StyleDetection.jsx` — typography/appearance matching
- `Detection/NameDetection.jsx` — naming-pattern matching
- `Detection/CombinedDetection.jsx` — combined deduplicated detection
- `Detection/DetectionRegistry.jsx` — method registry/dispatcher
- `Sections/SectionManager.jsx` — section CRUD, anchor/target assignment
- `Sections/RelationshipEngine.jsx` — section-to-section relationships
- `Rules/RuleValidator.jsx` — rule validation
- `Rules/RuleEngine.jsx` — rule CRUD, enable/disable, priority, duplicates
- `Rules/ConflictResolver.jsx` — conflicting rule detection
- `Rules/PresetManager.jsx` — presets, JSON import/export (no eval)
- `Spacing/SpacingCalculator.jsx` — gap delta computation
- `Spacing/SpacingEngine.jsx` — applying spacing to document
- `Spacing/PositionManager.jsx` — position snapshots for rollback
- `Preview/PreviewEngine.jsx` — preview entry computation
- `Preview/PreviewRenderer.jsx` — temporary visual indicators
- `Batch/BatchProcessor.jsx` — batch processing across scopes
- `Safety/TemporaryObjectManager.jsx` — temp object tracking/cleanup
- `Safety/TransactionManager.jsx` — transaction begin/commit/rollback
- `Safety/RollbackManager.jsx` — coordinated safe operations
- `UI/UIHelpers.jsx` — ScriptUI widget helpers
- `UI/Dashboard.jsx` through `UI/HelpPanel.jsx` — palette tabs
- `UI/MainWindow.jsx` — floating palette + action wiring
- `Main.jsx` — entry point

## Build
`build/build.js` reads modules in the deterministic order listed above, injects a version header and build variables, runs ES3 static checks, writes `dist/Illustrator_Smart_Spacing_Manager_Pro.jsx` plus a `.sha256` checksum. Reproducible when `SOURCE_DATE_EPOCH` is set.

## Data flow
Scan → Detection (items with reasons) → Section Manager (groups, anchors, targets) → Rule Engine (enabled rules) → Preview Engine (current gap vs target gap, deltas) → PreviewRenderer (optional temporary indicators) → Spacing Engine (applies movements via TransactionManager for rollback) → cleanup of temporary objects.

## ES3 compliance
No `let`/`const`/arrow functions/classes/template literals/async-await/optional chaining/nullish coalescing/import/Promise/fetch/eval. Static check enforced at build time.
