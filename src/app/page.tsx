import { questionsWithDeepDives, resourceGroups, leetcodeGroups } from "@/data";
import { BoardShell } from "@/components/board/BoardShell";

// Server Component: this module and its imports never ship to the browser
// as JavaScript. With `output: "export"` (see next.config.ts), Next.js runs
// this at build time to produce static HTML — the ~3,000 lines of
// question/lesson data are read from src/data once during `next build`, not
// re-parsed by every visitor's browser. The rendered content (and the props
// BoardShell needs to stay interactive) still reach the client, but the
// data-loading *code* itself does not become part of the client bundle.
export default function Home() {
  return (
    <main className="min-h-screen bg-[#e8e3d7] p-4 md:p-10">
      <BoardShell questions={questionsWithDeepDives} resourceGroups={resourceGroups} leetcodeGroups={leetcodeGroups} />
    </main>
  );
}
