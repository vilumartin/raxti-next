"use client";

interface LogoProps {
  /** "full" = icon + wordmark + tagline (Image 3 style)
   *  "compact" = icon + wordmark only (Images 4-5 style)
   *  "icon" = icon square only */
  variant?: "full" | "compact" | "icon";
  className?: string;
}

export const Logo = ({ variant = "compact", className = "" }: LogoProps) => {
  const showTagline = variant === "full";
  const showWordmark = variant !== "icon";

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Mic card — rounded square */}
      <svg
        width={variant === "icon" ? 56 : 48}
        height={variant === "icon" ? 56 : 48}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="micGrad" x1="18" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          {/* Card background gradient — subtle */}
          <linearGradient id="cardGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Rounded card background */}
        <rect width="56" height="56" rx="14" fill="url(#cardGrad)" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />

        {/* Mic body — pill shape with gradient */}
        <rect x="20" y="9" width="16" height="24" rx="8" fill="url(#micGrad)" />

        {/* Mic stand — vertical bar */}
        <line x1="28" y1="38" x2="28" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />

        {/* Mic base — horizontal bar */}
        <line x1="21" y1="44" x2="35" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />

        {/* Curved bracket (arm) */}
        <path
          d="M16 26 C16 35 40 35 40 26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.85"
        />

        {/* Sound waves — right side */}
        <path
          d="M39 20 C42 22 42 30 39 32"
          stroke="#3B82F6"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M43 17 C48 20.5 48 31.5 43 35"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.55"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="text-foreground font-black tracking-tight"
            style={{
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontSize: variant === "full" ? "2rem" : "1.6rem",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            raxti
          </span>
          {showTagline && (
            <span
              className="text-primary font-semibold uppercase tracking-widest mt-1"
              style={{
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
              }}
            >
              audio to text
            </span>
          )}
        </div>
      )}
    </div>
  );
};
