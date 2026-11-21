# Known Limitations — Illustrator Smart Spacing Manager Pro

## v0.1.1 (corrective prerelease)

1. **Not validated in live Adobe Illustrator.** All verification so far
   is automated unit testing (29 tests) under a mock Illustrator DOM in Node.js.
   Treat every feature as unimplemented-pending-real-world-testing.
2. **Visual gap measurement fallback.** Exact glyph-boundary measurement
   uses duplicate + `createOutline()`. Where outlining is unsupported or
   fails, the engine falls back to geometric bounds and marks the result
   "approximate." Approximate results are never reported as exact.
3. **Rotated objects.** Measured via axis-aligned bounding boxes;
   results for rotated artwork are approximate and flagged.
4. **Batch processing scope.** Operates within the active document only
   (selection, sections, artboards, or document). Cross-document batch
   is not implemented.
5. **Unicode / non-Latin text.** Text matching supports Unicode strings
   as far as ExtendScript allows; complex script shaping (Arabic,
   Indic, Bengali) measurement accuracy depends on the Illustrator
   version and is approximate.
6. **Artboard association.** Objects crossing artboard boundaries are
   detected and warned, but an object is not guaranteed to belong
   exclusively to one artboard.
7. **Preset file dialogs.** Export/import use ExtendScript `File`
   save/open dialogs; unavailable in headless or non-Illustrator hosts.
8. **Undo.** Relies on Illustrator's standard undo stack; no custom
   transactional undo beyond rollback of the current operation.
9. **No network / no external runtime.** By design; no online services,
   CEP, UXP, Node.js, or Python.

2. **Visual gap measurement fallback.** Exact glyph-boundary measurement
   uses duplicate + `createOutline()`. Where outlining is unsupported or
   fails, the engine falls back to geometric bounds and marks the result
   "approximate." Approximate results are never reported as exact.

3. **Rotated objects.** Measured via axis-aligned bounding boxes;
   results for rotated artwork are approximate and flagged.

4. **Batch processing scope.** Operates within the active document only
   (selection, sections, artboards, or document). Cross-document batch
   is not implemented.

5. **Unicode / non-Latin text.** Text matching supports Unicode strings
   as far as ExtendScript allows; complex script shaping (Arabic,
   Indic, Bengali) measurement accuracy depends on the Illustrator
   version and is approximate.

6. **Artboard association.** Objects crossing artboard boundaries are
   detected and warned, but an object is not guaranteed to belong
   exclusively to one artboard.

7. **Preset file dialogs.** Export/import use ExtendScript `File`
   save/open dialogs; unavailable in headless or non-Illustrator hosts.

8. **Undo.** Relies on Illustrator's standard undo stack; no custom
   transactional undo beyond rollback of the current operation.

9. **No network / no external runtime.** By design; no online services,
   CEP, UXP, Node.js, or Python.
