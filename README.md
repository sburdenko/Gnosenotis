# Unity Interview — 340 Questions (Next.js learning rewrite)

A senior/lead-level Unity interview prep site: 340 C#/rendering/gameplay
questions with bilingual (EN/RU) answers, ~140 "deep dive" lessons, a curated
reading list, 31 algorithm patterns with C# templates, and 58 LeetCode
problems — each with a naive-to-optimal solution ladder and links to the
patterns it drills — with reviewed/read/solved/learned progress saved to your
browser.

This is a rewrite of a single-file vanilla-HTML/CSS/JS app (kept for
reference in [`legacy/`](./legacy)) into **React + Next.js (App Router) +
TypeScript + Tailwind CSS**, done as a learning project to see the same
content and interactions expressed idiomatically in that stack:

- **React + Next.js** is the default industry stack today — the biggest
  ecosystem and job market, SSR/SSG/ISR built in, and the App Router's split
  between Server and Client Components (used throughout this codebase — see
  the comment in [`src/components/InterviewApp.tsx`](./src/components/InterviewApp.tsx)).
- Trade-off worth knowing going in: the server/client component split
  confuses even senior engineers at first, the ecosystem's "right way to do
  it" churns yearly, and React alone is just a view layer — everything else
  (routing, data fetching, styling) is assembled from other libraries, Next.js
  being the most common choice for that assembly.

## Project structure

```
src/
  types/content.ts         Question / ResourceGroup / LeetCodeGroup / AlgoPattern shapes
  data/
    questions.ts, deepDives.ts, resources.ts
    leetcode/              One file per difficulty; each problem lists its
                           patterns (`pat`) and its solution ladder (`sol`)
    patterns/              One file per pattern family; `index.ts` also
                           asserts every declared PatternId was written
  hooks/useProgressSet.ts  localStorage-backed "done" set (per board)
  lib/
    hostname.ts            Small URL helper
    patternUsage.ts        Reverse index: pattern -> the problems that drill it
  components/board/
    BoardShell.tsx         Tabs + root client state
    QuestionsBoard, ResourcesBoard, PatternsBoard, LeetCodeBoard
    Pinned*Card.tsx        One card renderer per content type
  app/
    layout.tsx, page.tsx, globals.css
```

The LeetCode and Patterns tabs are cross-linked: a problem card unfolds into
its approaches and the patterns behind them, and clicking a pattern chip
jumps to that pattern's card (template, pitfalls, and every problem that
practises it — derived from the problem data, never listed twice).

Every file has comments explaining the *why* behind non-obvious choices
(Server vs. Client Components, why some HTML is rendered with
`dangerouslySetInnerHTML` safely, immutable state updates, etc.) — read them
in place rather than here, they're kept next to the code they explain.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building & deploying

The site is statically exported (`output: "export"` in `next.config.ts`) —
there's no server, so it can be hosted anywhere that serves static files,
including GitHub Pages:

```bash
npm run build   # writes static HTML/JS/CSS to ./out
```

Pushing to `main` runs [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml),
which builds the site and publishes `./out` to GitHub Pages automatically.
