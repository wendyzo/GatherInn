import * as React from "react";

export function BrandLogo({ compact }: { compact?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
      <div className="font-display font-semibold tracking-tight">GatherInn</div>
      <span className="text-xs bg-[rgba(11,61,145,0.08)] text-[var(--primary-foreground)] border border-[rgba(11,61,145,0.08)] px-2 py-0.5 rounded-md uppercase font-mono font-medium">
        KMS
      </span>
    </div>
  );
}

export default BrandLogo;
