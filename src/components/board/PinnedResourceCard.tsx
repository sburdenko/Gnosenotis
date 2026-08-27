"use client";

import type { ResourceItem } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import { hostnameOf } from "@/lib/hostname";
import { PinnedCardShell } from "./PinnedCardShell";
import { Badge } from "./Badge";

interface PinnedResourceCardProps {
  item: ResourceItem;
  index: number;
  pinColor: PinColor;
  done: boolean;
  onToggleDone: () => void;
}

export function PinnedResourceCard({ item, index, pinColor, done, onToggleDone }: PinnedResourceCardProps) {
  const { t, pick } = useLanguage();

  return (
    <PinnedCardShell
      index={index}
      pinColor={pinColor}
      done={done}
      onTogglePin={onToggleDone}
      pinLabel={t.pinAria(done, "read")}
      meta={hostnameOf(item.u)}
      title={
        <a
          href={item.u}
          target="_blank"
          rel="noreferrer"
          className="text-link hover:text-link-hover hover:underline"
        >
          {item.t}
        </a>
      }
    >
      <p className="font-hand text-[18px] leading-tight text-hand">{pick(item.d, item.dru)}</p>
      {item.b.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.b.map((badge) => (
            <Badge key={badge} tone={badge}>
              {badge === "must" ? t.badges.mustRead : t.badges.free}
            </Badge>
          ))}
        </div>
      )}
    </PinnedCardShell>
  );
}
