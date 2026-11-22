# Product Requirements Document — Illustrator Smart Spacing Manager Pro

## 1. Overview
Product: Illustrator Smart Spacing Manager Pro
Platform: Adobe Illustrator (ExtendScript JSX)
UI: Floating ScriptUI Palette
File format: Single distributable `.jsx`
Version: 0.1.0 (prerelease)

## 2. Goals
Enable editorial and layout designers to apply consistent, precise, configurable spacing between repeated sections in Illustrator documents without CEP, UXP, Node.js, Python, or network access.

## 3. Mandatory features
- Object-to-Object gap measurement (geometric/visible/control bounds)
- Visual-to-Visual gap measurement (duplicate + outline, non-destructive)
- Vertical / Horizontal / Both / Auto direction; signed and absolute gaps; overlap detection
- Units: pt, mm, cm, in, px; configurable precision
- Four detection systems: Manual, Text, Style, Name, Combined
- Section Relationship Engine with anchor/target, multiple objects per section, nested/repeating structures
- Rule Engine: create/edit/duplicate/delete/enable/reorder/import/export rules; conflict detection
- Spacing Engine with anchor behaviors and per-rule scopes
- Preview engine with temporary visual indicators and guaranteed cleanup
- Batch processing by selection/sections/artboard(s)/document
- Presets: Book, Magazine, Editorial, Report, Catalogue, General, Custom
- Non-destructive operation: original text never outlined, rollback support
- Dashboard, Detection, Sections, Measurement, Rules, Preview, Batch, Settings, Help panels

## 4. Safety requirements
- Never delete or outline original artwork
- Clean up temporary objects in finally blocks
- Try/catch/fail-safe on all Illustrator DOM calls
- No silent failures; meaningful errors and warnings

## 5. Acceptance criteria
See acceptance checklist in the master spec. v0.1.0 is a prerelease pending live Illustrator validation.
