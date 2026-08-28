# Unity Interview — 340 Questions (Next.js learning rewrite)

A senior/lead-level Unity interview prep site: 340 C#/rendering/gameplay
questions with bilingual (EN/RU) answers, ~140 "deep dive" lessons, a curated
reading list, and 58 LeetCode problems — with reviewed/read/solved progress
saved to your browser.

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
  types/content.ts        Question / ResourceGroup / LeetCodeGroup shapes
  data/                    Content extracted verbatim from legacy/, typed
  hooks/useProgressSet.ts  localStorage-backed "done" set (reading/LeetCode progress)
  lib/hostname.ts          Small URL helper
  components/
    InterviewApp.tsx       Tabs + root client state
    questions/              Search, category filter, cards, deep-dive modal
    resources/              Reading list
    leetcode/               LeetCode list + difficulty filter
    shared/                 ProgressBar, etc.
  app/
    layout.tsx, page.tsx, globals.css
```

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
