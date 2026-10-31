import type { ReactNode } from "react";
import { Arrow } from "./Glyphs";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** "lg" = 52px hero CTA, "md" = 44px, "sm" = 40px nav CTA. */
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
};

const heights = { sm: "h-10 px-5", md: "h-11 px-5", lg: "h-13 px-6" } as const;

/** The accent-filled primary action. One per viewport (direction.md). */
export function ButtonLink({ href, children, className = "", size = "lg", arrow = true }: ButtonLinkProps) {
  return (
    <a href={href} className={`btn inline-flex ${heights[size]} ${className}`}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </a>
  );
}

/** Underlined text link with a decorative arrow. */
export function TextLink({
  href,
  children,
  className = "",
  arrow,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: "right" | "down";
}) {
  return (
    <a href={href} className={`tlink ${className}`}>
      {children}
      {arrow && (
        <>
          {" "}
          <Arrow dir={arrow} />
        </>
      )}
    </a>
  );
}
