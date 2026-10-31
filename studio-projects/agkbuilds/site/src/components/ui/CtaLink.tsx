import { mailtoHref } from "@/lib/data";

/**
 * The one button style (layout-spec Global "Buttons"): the primary CTA, a mailto: link with the
 * subject from contact.mail_subject and no body. `draw` is the contact variant (motion C2):
 * outline first, then the fill.
 */
export function CtaLink({
  label,
  describedBy,
  draw = false,
  className = "",
}: {
  label: string;
  describedBy?: string;
  draw?: boolean;
  className?: string;
}) {
  return (
    <a href={mailtoHref} aria-describedby={describedBy} className={`btn ${draw ? "btn-draw" : ""} ${className}`}>
      {draw && <span className="cta-fill" aria-hidden="true" />}
      <span className="btn-label">{label}</span>
      <span className="btn-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
