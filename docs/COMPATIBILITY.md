# Compatibility — Illustrator Smart Spacing Manager Pro

## Target platform
Adobe Illustrator, ExtendScript (JavaScript ES3-compatible), ScriptUI.

## Compatibility matrix

| Version | OS | Status | Evidence |
|---------|-----|--------|----------|
| Not yet tested | — | Pending | No Illustrator installation available in this build environment |

## Notes
- ExtendScript availability: assumed in target Illustrator; not verified here.
- ScriptUI palette type: floating (`Window("palette", ...)`).
- Font rendering, DOM behavior, and text measurement may differ across
  Illustrator versions and operating systems (Windows/macOS).
- Visual measurement relies on `TextFrame.createOutline()` on a
  duplicate; behavior with missing fonts or complex scripts is version-
  dependent.

## Verified vs untested
No Illustrator version or operating system has been verified for this
prerelease. All compatibility claims below v1.0.0 are unverified targets.
