export type PinColor = "red" | "blue" | "green" | "yellow";

/** Radial-gradient "plastic pin head" look, ported from the design handoff. */
export const PIN_GRADIENT: Record<PinColor, string> = {
  red: "radial-gradient(circle at 35% 30%, #ff8a7a, #a81e15)",
  blue: "radial-gradient(circle at 35% 30%, #8fd6ff, #175f8f)",
  green: "radial-gradient(circle at 35% 30%, #b6f08a, #2f7a1c)",
  yellow: "radial-gradient(circle at 35% 30%, #ffd98a, #b5810f)",
};

const PIN_CYCLE: PinColor[] = ["red", "blue", "green", "yellow"];

/** Cycles through the 4 pin colors by position, so e.g. every category gets a consistent, distinct pin. */
export function pinColorForIndex(index: number): PinColor {
  return PIN_CYCLE[index % PIN_CYCLE.length];
}

/**
 * Small, fixed set of tilt angles applied by card position (not per-card
 * randomness) — random rotation would make cards visibly jump to a new
 * angle on every re-render/re-filter, which reads as broken rather than
 * "pinned to a board".
 */
export const CARD_TILTS = [-0.7, 0.6, 1, -1.1] as const;

export function tiltForIndex(index: number): number {
  return CARD_TILTS[index % CARD_TILTS.length];
}
