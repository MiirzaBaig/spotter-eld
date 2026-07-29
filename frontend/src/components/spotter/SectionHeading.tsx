import type { ReactNode } from "react";

export function SectionHeading({
  number,
  title,
  aside,
}: {
  number: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
      <h2 className="flex items-baseline gap-2.5 text-h2 text-foreground sm:gap-3">
        <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-accent-soft px-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-accent">
          {number}
        </span>
        <span className="whitespace-nowrap">{title}</span>
      </h2>
      {aside && <div className="mono-eyebrow hidden shrink-0 text-right sm:block">{aside}</div>}
    </div>
  );
}
