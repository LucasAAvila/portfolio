interface SectionHeaderProps {
  slash: string;
  label?: string;
  title: string;
  id?: string;
}

export function SectionHeader({ slash, label, title, id }: SectionHeaderProps) {
  return (
    <div id={id}>
      <div className="flex items-center gap-2 mb-[10px]">
        <span className="font-mono text-[10px] tracking-[0.1em] text-accent">/ {slash}</span>
        {label && (
          <span className="text-[10px] tracking-[0.14em] uppercase text-text-faint">{label}</span>
        )}
      </div>
      <h2 className="text-[26px] font-bold tracking-normal text-text mb-7">{title}</h2>
    </div>
  );
}
