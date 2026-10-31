// From studio/content/metadata.md. No absolute URL anywhere (decisions #13): the site address
// comes only from NEXT_PUBLIC_SITE_URL, and canonical / og:url / metadataBase are emitted only
// when it is set. Unset, the exported HTML contains no absolute page URL and no "localhost".
export const siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL?.trim() || undefined;

export const site = {
  title: "Agkbuilds: Custom software built to fit your business",
  description:
    "Agkbuilds builds custom software, including data recovery tools, card games and Discord bots. Start a conversation by email or phone.",
  og: {
    type: "website",
    title: "Agkbuilds: Custom software, drawn to fit",
    description:
      "Custom software planned first, then built around the way your business works. Email agkbuilds@gmail.com or call 254-231-1149.",
    imageAlt: "Agkbuilds: Custom software, drawn to fit. Then built.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agkbuilds: Custom software, drawn to fit",
    description: "Custom software planned first, then built around the way your business works.",
  },
  notFoundTitle: "Sheet not found: Agkbuilds",
  locale: "en_US",
} as const;

// JSON-LD verbatim from metadata.md (no logo, address or sameAs; page.tsx adds `url` only when
// NEXT_PUBLIC_SITE_URL is set, as metadata.md allows).
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Agkbuilds",
  description: "Agkbuilds builds custom software, including data recovery tools, card games and Discord bots.",
  email: "agkbuilds@gmail.com",
  telephone: "+1-254-231-1149",
} as const;
