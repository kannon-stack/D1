# Fonts

Archivo, by The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo), licensed under the SIL Open Font License 1.1. The full licence and copyright notice are in `OFL.txt`, which must ship with these files.

- `archivo-normal.woff2`: a subset of the variable Archivo (normal), with the width (`wdth`) and weight (`wght`) axes kept.
- `archivo-italic.woff2`: a subset of the variable Archivo Italic, with the same axes kept.

Each subset covers printable ASCII (U+0020–U+007E) plus the non-ASCII symbols used in `src/content/copy.ts`.

The exact subsetting command wasn't recorded. To regenerate the files, take the variable TTFs from google/fonts (`ofl/archivo/`), list the non-ASCII characters in `src/content/copy.ts`, and subset each TTF to printable ASCII plus those characters with fontTools' `pyftsubset`, writing WOFF2 output with both variation axes kept. Then check that `layout.tsx` still loads the files.
