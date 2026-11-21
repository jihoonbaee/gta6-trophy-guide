# Vice City Trophy Codex
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jihoonbaee/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jihoonbaee/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A guide and personal checklist for all 55 Grand Theft Auto VI PlayStation 5 trophies. The original CSS sunset palette frames a readable list, cited guides, and a five-stage route to platinum.

Run `node serve.ts`, then open http://localhost:8080. The app uses plain HTML, CSS, JavaScript modules, and two local data files. It needs no installation or build step. With the local server running, it works without internet access. Source links open only when clicked.

Check trophies to save your progress in this browser. The platinum unlocks automatically after the other 54 awards. The header shows total progress, counts by grade, and a citation audit calculated from the data. There are 96 guide-level citations across 14 distinct IGN URLs.

Use kind, earned status, name search, and the independent missable filter together. The spoiler shield conceals unearned story names, descriptions, and guides. Export JSON makes a portable backup; Import JSON restores it after validation. Shot scenes use isolated demo progress and never overwrite personal progress.

Select a trophy for its guide, procedure, linked sources, and any documented missable warning. The roadmap orders all five stages and lists their trophies, planning descriptions, points of no return, and sources. Guidance preserves the source data's stated uncertainty about undocumented routes and recovery methods.

To reproduce the four screenshots, leave the local server running and execute `node capture.mjs`. This uses the installed Chromium headless shell and Python Pillow, checks scene readiness, and writes the JPEGs to `screenshots/`. The URLs are `?shot=cover`, `?shot=guide`, `?shot=roadmap`, and `?shot=tracker`.

To package locally, run `MAKEFUN_OUTPUT_DIR=out node main.ts`. The output contains the app, screenshots, and the dossier returned by the supplied kit. App assets use system fonts and original CSS only. There is no official artwork, logo, or game font.
