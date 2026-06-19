import * as React from "react";

export function BrandLogo({ compact }: { compact?: boolean }) {
  return (
    <img
      src="/logo.svg"
      alt="GatherInn"
      className={compact ? "h-8" : "h-10"}
    />
  );
}

export default BrandLogo;
