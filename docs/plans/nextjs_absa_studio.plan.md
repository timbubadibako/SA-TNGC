# Plan: Next.js ABSA Web Studio in /fe

## Target Architecture
- Directory: `fe/`
- Framework: Next.js 15+ (App Router) + TypeScript + Tailwind CSS
- Dependencies: `chart.js` (minimal native)

## Task Checklist
- [x] Step 1: Scaffold Next.js project inside `fe/` without overwriting existing assets/pages until ready.
- [ ] Step 2: Configure `tailwind.config.ts` with custom font `Space Mono`, color variables (`--color-pos`, `--color-neg`, dll.).
- [ ] Step 3: Implement modular React components:
  - `Header`: Plek ketiplek `index.html`.
  - `SentimentTicker`: 4 item ticker.
  - `AspectChart`: Chart.js canvas dengan filter view selector (`BAR POLARITAS` / `BREAKDOWN`).
  - `AspectSummaryStrip`: Metriks ringkasan ulasan per aspek.
  - `SidebarLLM`: Compact model meta, Short vs Long tabs, Error handler box, dan modal dialog "Hubungkan API LLM" (Raw JSON dihilangkan).
- [ ] Step 4: Verification & Test Build (`npm run build`).
- [ ] Step 5: Dev Log & Release Commit.
