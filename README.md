# Illustrator Smart Spacing Manager Pro

Professional Adobe Illustrator automation for consistent, precise spacing between design sections — built entirely in Adobe ExtendScript (JSX) with a floating ScriptUI palette.

## What it does

Illustrator Smart Spacing Manager Pro helps designers working on books, e-books, magazines, editorial layouts, catalogues, brochures, reports, and multi-artboard documents establish consistent spacing between repeated content structures (chapter headings and body text, subheadings and paragraphs, illustrations and captions, etc.).

- **Two measurement systems**: Object-to-Object gap (geometric bounds) and Visual-to-Visual gap (duplicate + outline technique that never destroys original editable text).
- **Four detection systems**: Manual selection, text matching, style matching, object naming, and combined detection.
- **Section Relationship Engine**: anchor/target assignment, heading-to-content, content-to-heading, section-to-section relationships.
- **Rule Engine**: multiple independent, prioritized, enable/disable spacing rules with conflict detection.
- **Spacing Engine**: computes target-gap deltas and applies them with configurable anchor behavior (move lower, move upper, symmetric, keep first/last).
- **Preview engine**: before/after preview with proposed movements and cleanup of temporary indicators.
- **Batch processing**: per-artboard or whole-document processing with summaries.
- **Presets**: built-in layouts (Book, Magazine, Editorial, Report, Catalogue, General, Custom) plus import/export.
- **Safety**: non-destructive by design — original text is never outlined, temporary objects are cleaned up, rollback support.

## Deliverable

A single standalone file:

```
dist/Illustrator_Smart_Spacing_Manager_Pro.jsx
```

No CEP, no UXP, no Node.js, no Python, no internet connection required. Runs inside Adobe Illustrator via File > Scripts > Other Script.

## Version

`v0.1.0` — prerelease. Core algorithms implemented and unit-tested (26 automated tests, all passing under a mock Illustrator DOM). **Not yet validated in live Adobe Illustrator** — see COMPATIBILITY.md and KNOWN_LIMITATIONS.md.

## Install

1. Copy `dist/Illustrator_Smart_Spacing_Manager_Pro.jsx` into your Illustrator scripts folder, or keep it anywhere and launch via File > Scripts > Other Script.
2. In Illustrator, open a document, then run the script.
3. A floating palette ("Smart Spacing Manager Pro") appears. Use the Dashboard to scan, then Detection to find objects, Sections to group them, Rules to define spacing targets, and Preview/Apply to adjust spacing.

See INSTALLATION.md for platform-specific paths.

## Quick start

1. Open an Illustrator document with repeated headings.
2. Run the JSX; the floating palette opens.
3. Dashboard > Scan Document.
4. Detection > Text Matching > pattern "Chapter" > Detect Objects.
5. Sections > create sections, assign anchor (heading) and target (body text).
6. Rules > create rule "Chapter to Body", Visual gap, Vertical, target 40 pt.
7. Preview > Build Preview > review proposed movements > Apply.
8. Undo in Illustrator if needed (standard Edit > Undo).

## Repository structure

```
src/            ES3-compatible modular source (45 modules)
build/          Build script (concatenates to single JSX)
tests/          Unit tests (Node.js + mock Illustrator DOM)
dist/           Built distributable JSX (+ checksums)
docs/           PRD, architecture, user guide, compatibility, limitations
.github/        Release workflow
```

## License

MIT — see LICENSE.

## Status

Automated unit tests: 26/26 passing. Build: reproducible (with SOURCE_DATE_EPOCH), ES3-validated, single-file output. Live Illustrator validation is pending — mark this as a prerelease until tested in the target application.
