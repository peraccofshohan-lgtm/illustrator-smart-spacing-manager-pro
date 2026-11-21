# Illustrator Smart Spacing Manager Pro — v0.1.0 (prerelease)

## What this is
A professional Adobe Illustrator automation tool delivered as a single
standalone ExtendScript JSX file with a floating ScriptUI palette. No CEP,
no UXP, no Node.js, no Python, no internet connection required.

## Asset
- `Illustrator_Smart_Spacing_Manager_Pro.jsx` — the distributable script
- `Illustrator_Smart_Spacing_Manager_Pro.jsx.sha256` — SHA-256 checksum

## Status
PRERELEASE. Core algorithms implemented and verified with 26 automated
unit tests under a mock Illustrator DOM (all passing). Build is
ES3-validated and reproducible (with SOURCE_DATE_EPOCH).

**This release has not yet been validated in live Adobe Illustrator.**
Do not use on production documents without first running the manual test
plan in docs/TESTING.md.

## Main features
- Object-to-Object and Visual-to-Visual gap measurement
- Vertical / Horizontal / Both / Auto direction; signed & absolute gaps; overlap detection
- Units: pt, mm, cm, in, px; configurable precision
- Detection: manual selection, text matching, style matching, object naming, combined
- Section Relationship Engine (anchor/target, nested & repeating sections)
- Rule Engine: create/edit/disable/reorder rules, conflict detection
- Preview with proposed movements and guaranteed temporary-object cleanup
- Batch processing by selection/sections/artboard(s)/document
- Built-in presets: Book, Magazine, Editorial, Report, Catalogue, General, Custom
- Non-destructive: original text is never outlined; rollback support

## Installation
Copy the JSX into Illustrator's Scripts folder, or run via
File > Scripts > Other Script. See docs/INSTALLATION.md.

## Verification
- Size: 144,645 bytes
- SHA-256: b3c435ece470ec9e2f68d5d0825e0f56f11fcf84fff3043c611d61bfea665a94
- Unit tests: 26/26 passing
- ES3 compatibility: validated at build time
- Live Illustrator testing: pending
