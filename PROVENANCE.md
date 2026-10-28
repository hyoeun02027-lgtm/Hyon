# manseryeok

- Repository: https://github.com/yhj1024/manseryeok
- Pinned commit: fba3253d7305b8b61189bd78318a7a27ed8c9b09
- Upstream package: 2.0.0
- License: MIT, see manseryeok.LICENSE
- Browser IIFE: src/index.ts bundled with esbuild; no engine logic modified.
- Calculation runs locally; no analytics, no AI calculation, no live KASI API call.
- Upstream source tested: 72/72 tests passed, including golden fixtures, calendar round trips and lunar-javascript cross-validation. This is not certification by KASI.
- Engine calendar tables use KASI-derived data as documented upstream. KASI XML conversion API requires a service key and has not been live-verified in this environment.
- UI intentionally supports input years 1990–2026, fixed UTC+9 (no Korean historical DST in this interval); no overseas/local apparent solar time conversion. Dates beyond today rejected.
- Unknown time evaluates 1,440 minutes, omits hour pillar, reports year/month/day ambiguities. Element counts only use stable pillars. Day-master ambiguity suppresses ten gods.
- Solar terms are minute-level; the library table is wider than the UI's supported range.
- Day boundary can be midnight, jasi or splitJasi, as documented in the engine.

Rebuild: clone the pinned revision, npm ci, npm run test:run, npm run build, then bundle src/index.ts with esbuild --bundle --minify --format=iife --global-name=Manseryeok. Existing pinned bundle remains the deployed artifact; do not update on every load.
