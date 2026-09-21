/**
 * Renders the `backtick`-quoted spans of an explanation as <code>.
 *
 * The bug-hunt texts are plain data, never HTML, so this is a two-line
 * parser instead of `dangerouslySetInnerHTML` — nothing in the string can
 * turn into markup, whatever it contains.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split("`");

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-sm bg-black/[.06] px-1 font-mono text-[13px]">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
