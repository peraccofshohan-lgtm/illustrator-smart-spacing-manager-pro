# Installation — Illustrator Smart Spacing Manager Pro

## Requirements
- Adobe Illustrator (ExtendScript-capable; ScriptUI supported)
- No Node.js, Python, CEP, UXP, or internet connection needed

## Install the script

1. Obtain `dist/Illustrator_Smart_Spacing_Manager_Pro.jsx` from the
   repository (build it with `npm run build` or download from the
   GitHub Release).
2. Copy it to any convenient location, or into Illustrator's scripts
   folder so it appears directly in the File > Scripts menu:

   - **macOS**: `/Applications/Adobe Illustrator <version>/Presets/<locale>/Scripts/`
   - **Windows**: `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\<locale>\Scripts\`

   User scripts folder (safer, no admin rights):
   - **macOS**: `~/Library/Preferences/Adobe Illustrator <version> Settings/<locale>/Scripts/`
   - **Windows**: `%APPDATA%\Adobe\Adobe Illustrator <version>\<locale>\Scripts\`

3. Restart Illustrator (or the script will be available immediately if
   placed in the Scripts folder).

## Launching
- If installed in the Scripts folder: File > Scripts >
  Illustrator Smart Spacing Manager Pro.
- Otherwise: File > Scripts > Other Script, then select the `.jsx` file.

## Developing / building
```bash
npm install        # only if you want to run the dev toolchain
npm run build      # produce dist/Illustrator_Smart_Spacing_Manager_Pro.jsx
npm test           # run 26 unit tests under Node.js (mock DOM)
```

The runtime JSX itself needs nothing but Illustrator.
