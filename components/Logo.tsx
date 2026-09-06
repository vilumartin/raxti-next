"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface LogoProps {
  /** "full"    = icon + wordmark + tagline (auth page hero)
   *  "compact" = icon + wordmark only (nav bar)
   *  "icon"    = icon square only */
  variant?: "full" | "compact" | "icon";
  className?: string;
  height?: number;
}

export const Logo = ({ variant = "compact", className = "", height }: LogoProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const src = (() => {
    if (variant === "icon")    return isDark ? "/images/raxti-icon-dark.svg"         : "/images/raxti-icon-light.svg";
    if (variant === "full")    return isDark ? "/images/raxti-logo-full-dark.svg"    : "/images/raxti-logo-full-light.svg";
    /* compact */              return isDark ? "/images/raxti-logo-nav-dark.svg"     : "/images/raxti-logo-nav-light.svg";
  })();

  const defaultHeight = variant === "full" ? 72 : variant === "icon" ? 48 : 48;

  return (
    <img
      src={src}
      alt="raxti logo"
      height={height ?? defaultHeight}
      style={{ height: `${height ?? defaultHeight}px`, width: "auto" }}
      className={className}
    />
  );
};
