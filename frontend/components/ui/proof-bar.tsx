import { cn } from "@/lib/utils";

export interface ProofItem {
  value: string;
  label: string;
  mono?: boolean;
}

interface ProofBarProps {
  items: ProofItem[];
}

export function ProofBar({ items }: ProofBarProps) {
  return (
    <div className="bg-surface-1 border-y border-border-1">
      <div className="mx-auto max-w-[780px] grid grid-cols-2 sm:flex sm:gap-0 px-4 sm:px-10 py-5">
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className={cn(
              "flex-1 px-3 sm:px-5 py-2 sm:py-0",
              "border-border-1",
              "sm:border-r sm:last:border-r-0 sm:first:pl-0 sm:last:pr-0"
            )}
          >
            <div
              className={cn(
                "leading-none",
                item.mono
                  ? "font-mono text-[14px] text-accent mt-[2px]"
                  : "text-[22px] font-bold text-text"
              )}
            >
              {item.value}
            </div>
            <div className="text-[10px] tracking-[0.08em] uppercase text-text-faint mt-[3px] max-w-[12ch] leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
