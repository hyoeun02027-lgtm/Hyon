# 시대인재(時代因材) · 마지막 도구

Additive enhancement of the existing owner-private Site. Same project ID, URL, reading engine and pixel assets. Baseline source commit: `f24b841639d4dee6cf6abe352497d616e6d2bea9`; recovery tag `pre-sidae-20261028`.

## Runtime

Buildless static app, deploy `dist/` using `.openai/hosting.json`.

- `sidae-core.js`: genuine manseryeok wrapper, symbolic glossary, five questions, curated history catalog, weighted deterministic TOP3, choice tags and comparison.
- `sidae.js` / `sidae.css`: service landing, birth/value input, QUICK results, details, recommendations, personalized intro, ending reflection and eight PNG cards.
- `vn-core.js`: unchanged reading state machine and click/transition guards.
- `vn.js`: existing stable actors, blink/expression frames, typing, auto, logs, save, keyboard; minimal successful-choice recording hook and scene action metadata.
- `app.js`: existing routing/save format retained, new home/setup/result delegates. Original legacy rendering helpers retained for recovery.
- `dist/vendor/manseryeok.js`: MIT v2.0.0 pinned upstream commit, attribution in vendor directory. No model computes pillars.

## Computation and scope

Supported birth input years: 1990–2026, UTC+9, no future dates. Lunar/leap conversion, minute-level solar-term year/month pillars, three selectable day-boundary conventions, element counts and stem/branch-main-qi ten gods. Unknown time evaluates all 1,440 minutes: hour omitted, ambiguous pillars shown as candidates, only stable pillars counted. No invented noon-based hour.

The selected range avoids Korea's historical DST/timezone changes. Overseas local time and true-solar-time adjustment are not offered. Upstream supports a broader range; the UI does not claim that range. Unknown-time ambiguity is not resolved by guessing.

KASI API schema and access requirements inspected. No key supplied: **live KASI verification not run**. Engine's bundled KASI-derived lunar data is used offline. `KASI_SERVICE_KEY=... node scripts/verify-kasi.mjs` can verify solar-to-lunar fixtures after a decoded key is provisioned securely. It never logs keys/URLs. Lunar calendar month ganji is not the same as solar-term saju month pillar.

QUICK is a deliberately simple, labelled rule-based symbolic interpretation, not AI counselling, personality diagnosis, prediction or a full application of classical 格局/用神/調候 theory. Weights (editable `SidaeCore.weights`): values 40%, activities 30%, symbolism 30%. History affinities are editorial, not measured historical personalities. Six independently sourced occupational profiles; top three distinct domains; only the existing artisan story is playable.

## Story preservation and supplemental sources

The original seven prose nodes (common intro, A, B, AA, BB, AAA, BBB) and source spans remain intact. `tests/source-audit.py` independently checks them against the original 22-page PDF. Existing assets, three choices, eight routes and saves retained.

Four newly attached image PDFs are retained under `sources/` (not deployed), with names and SHA256 in `sources/manifest.json`. OCR is an intermediate aid, not served text. `content/expanded-scenes.txt` is the edited reading text for the previously table-only AB/BA connections and six endings, each linked to PDF page ranges. It removes duplicated setup/editor notes, keeps causal events and endings distinct, and does not replace the original two complete routes. These are edited scenes, **not full verbatim transcriptions of all four PDFs**. Their literary fidelity still benefits from author review. Historical chronology ambiguities in supplied fiction are disclosed, not presented as verified facts.

Rebuild reading data: `python scripts/build-novel.py && python scripts/expand-scenes.py`. The pre-existing extract.py replaces story.json; if re-extracting, retain the explicitly edited AB/BA/AA choice text.

## Privacy and progress

No name, birth date or birth clock time is stored/sent. Computation stays in browser. Optional saved profile stores derived pillars/analysis and questionnaire answers. Game runs store the answers at run start, choice path/title/timestamp/values/impact and final ending locally. Old saves have no fabricated timestamps or retroactive profile. Restart resets run choices. Delete clears both profile and progress. Sharing cards contain only fictional era/job/ending/choices and built-in artwork; no birth information. No accounts, analytics or server AI.

## Validation

```
python tests/source-audit.py
node tests/novel-core.cjs
node tests/novel-ui.cjs
node tests/sidae-core.cjs
# Test-only packages: jsdom@26.1.0 and @napi-rs/canvas@0.1.80
NODE_PATH=/path/to/test/node_modules node tests/sidae-dom.cjs
```

Passed: upstream 72 tests; solar/lunar equivalence, leap date, bad-date rejection, unknown hour, 입춘 minute before/after, all three day boundaries; 32 questionnaire combinations (23 different rankings), deterministic diverse top3; all eight complete paths, input guards, actor DOM continuity, save/resume, menus/keyboard/auto; actual DOM form→recommendation→game→comparison integration; eight real PNG outputs without birth info, reset/delete.

Card PNGs rendered using a Korean subset font and visually inspected. Font self-hosted under OFL, license included. DOM testing is not browser device/layout QA. The supplied browser cannot start (`bwrap` read-only sessions directory); desktop/mobile layout, touch, native share sheet and sound playback remain **unverified**. Responsive CSS and reduced-motion behavior are implemented; commercial readiness is not asserted. No external KASI live call or expert historical/literary certification was performed.
