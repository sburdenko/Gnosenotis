import { Fragment } from "react";

/**
 * Renders `text` as plain text, wrapping every case-insensitive match of
 * `term` in a `<mark>`.
 *
 * This replaces the legacy `esc()` + `hl()` pair, which built an HTML string
 * (`str.replace(...)`) and injected it with `innerHTML`. Because `q`/`qru`
 * are plain question text — not the trusted authored HTML that `a`/`aru`
 * contain — we render them as real React children instead: React escapes
 * text nodes automatically, so there is no way for question text to be
 * interpreted as markup, and no `dangerouslySetInnerHTML` is needed here at all.
 */
export function Highlight({ text, term }: { text: string; term: string }) {
  const trimmed = term.trim();
  if (!trimmed) return <>{text}</>;

  // Escape regex metacharacters in the user's search term before using it
  // to build a RegExp, so typing e.g. "C++" doesn't throw.
  const escapedTerm = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedTerm})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
