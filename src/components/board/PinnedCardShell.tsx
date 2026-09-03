"use client";

import { PIN_GRADIENT, tiltForIndex, type PinColor } from "@/lib/boardVisuals";

interface PinnedCardShellProps {
  /** Position among currently visible cards — drives the deterministic tilt angle. */
  index: number;
  pinColor: PinColor;
  done: boolean;
  onTogglePin: () => void;
  pinLabel: string;
  title: React.ReactNode;
  meta: React.ReactNode;
  onHeaderClick?: () => void;
  children?: React.ReactNode;
  /**
   * Unfolded content, drawn as a panel hanging *over* the cards below rather
   * than in the grid flow. Expanding a card this way never changes the row
   * height, so the neighbours stay exactly where they were — the point of
   * pinning things to a board is that they don't shuffle around.
   */
  overlay?: React.ReactNode;
}

/**
 * Shared "index card pinned to a corkboard" shell — the paper texture, tilt,
 * hover lift, colored pin, and title/meta header row that `PinnedQuestionCard`,
 * `PinnedResourceCard`, and `PinnedLeetCodeCard` all wrap around their own body content.
 *
 * The tilt is applied via the `--tilt` CSS variable (set inline, since the
 * angle is a computed float, not one of a fixed set of Tailwind utility
 * values) and consumed by the plain-CSS `.pin-card` rules in globals.css —
 * including the hover lift and the mobile breakpoint that flattens tilts
 * back to 0. Doing the hover state in CSS rather than a mouseenter/mouseleave
 * handler means it falls out for touch devices and `prefers-reduced-motion` for free.
 */
export function PinnedCardShell({
  index,
  pinColor,
  done,
  onTogglePin,
  pinLabel,
  title,
  meta,
  onHeaderClick,
  children,
  overlay,
}: PinnedCardShellProps) {
  const tilt = tiltForIndex(index);

  return (
    <article
      className={
        "pin-card tex-paper-ruled relative border border-black/10 px-5 pt-6 pb-5 shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:shadow-card-hover " +
        (overlay ? "z-30" : "")
      }
      style={{ "--tilt": `${tilt}deg`, filter: done ? "saturate(.85)" : undefined } as React.CSSProperties}
    >
      <button
        type="button"
        aria-pressed={done}
        aria-label={pinLabel}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        className="absolute -top-2 left-1/2 size-[17px] -ml-2 rounded-full shadow-pin outline-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        style={{
          backgroundImage: PIN_GRADIENT[pinColor],
          opacity: done ? 0.5 : 1,
          transform: done ? "scale(.85)" : undefined,
        }}
      />

      <header
        className={`mb-[11px] flex items-baseline justify-between gap-3 border-b-2 border-[rgba(170,50,40,.45)] pb-1.5 ${onHeaderClick ? "cursor-pointer" : ""}`}
        onClick={onHeaderClick}
      >
        {/*
          `overflow-wrap: anywhere` rather than `break-words`: only `anywhere`
          also shrinks the element's min-content width, which is what lets a
          title like "ISerializationCallbackReceiver" — one word wider than a
          phone screen — stop dragging the whole page into a sideways scroll.
        */}
        <h3 className="min-w-0 font-serif text-[19px] leading-tight font-bold text-ink [overflow-wrap:anywhere]">
          {title}
        </h3>
        <span className="shrink-0 font-mono text-[11px] text-ink-muted">{meta}</span>
      </header>

      {children}

      {overlay && (
        <div className="tex-paper-ruled absolute top-full -right-px -left-px border border-t-0 border-black/10 px-5 pb-5 shadow-card-hover">
          {overlay}
        </div>
      )}
    </article>
  );
}
