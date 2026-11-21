# User Guide — Illustrator Smart Spacing Manager Pro

## Opening the script
In Adobe Illustrator, choose File > Scripts > Other Script and select
`Illustrator_Smart_Spacing_Manager_Pro.jsx`. A floating palette opens.
It can be docked or left floating like any ScriptUI palette.

## Panels

### Dashboard
Shows the active document, artboard count, detected objects/sections,
active rules, last operation, current mode, and warnings.
Quick actions: Scan Document, Refresh Selection, Preview, Apply,
Undo Guidance, Open Rule Manager.

### Detection
Choose a detection method:
- **Manual Selection**: use currently selected objects.
- **Text Matching**: match text frame contents (exact/contains/starts
  with/ends with/regex/pattern), case-sensitive or not.
- **Style Matching**: match font family/style/size, colors, opacity,
  object type, etc.
- **Object Naming**: match page item names (prefix/suffix/wildcard/regex).
- **Combined Detection**: combine methods; duplicate objects are merged.

Click Detect Objects to populate the results list.

### Sections
Create sections, name them, set a type (heading, content, subheading,
illustration, caption), and assign anchor and target objects. A section
can contain multiple objects.

### Measurement
Choose Object Gap or Visual Gap, bounds type (geometric/visible/control),
direction (vertical/horizontal/both/auto), units (pt/mm/cm/in/px), and
precision. Measure a selected pair and review the signed gap, overlap
warning, and reliability.

### Rules
Create spacing rules with name, detection config, measurement mode,
direction, target gap, unit, tolerance, scope, anchor behavior, and
priority. Enable/disable, duplicate, delete, and reorder rules.

### Presets
Save the current rules as a preset, export/import presets as JSON, and
delete presets. Built-in presets: Book, Magazine, Editorial, Report,
Catalogue, General Graphic Design, Custom.

### Preview
Build a preview showing current gap → target gap, required adjustment,
proposed movement, and warnings per section. Apply selected or all.
Temporary visual indicators are cleared on cancel.

### Batch
Process by selection, sections, active artboard, selected artboards,
all artboards, or whole document. Review the batch summary.

### Settings & Help
Configure defaults (unit, precision, mode, exclusions, preview
indicators). View version, supported features, known limitations, and
the error log.

## Safety
Original text frames are never outlined. Measurements on text use a
duplicated temporary copy that is removed after measurement. Temporary
preview layers are removed on cancel or close. All changes can be undone
with Illustrator's standard Edit > Undo.

## Known limitations
- Visual measurement of complex text falls back to geometric bounds and
  is marked "approximate."
- Rotated objects are measured with axis-aligned bounding boxes.
- Batch processing works within the active document only.
- This prerelease (v0.1.0) has not yet been validated in live Illustrator.
