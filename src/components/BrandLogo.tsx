import * as React from "react";

export function BrandLogo({ compact }: { compact?: boolean }) {
  return (
    <img
      src="/gather-logo.svg"
      alt="Gather Inn"
      className={compact ? "h-8" : "h-10"}
    />
  );
}

export default BrandLogo;
