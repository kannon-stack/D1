# Metadata: Agkbuilds

**Domain pending (decisions #13).** No website address is known, so this file carries no absolute URL: no `url`, no canonical link, no `og:url`, and no `sameAs`. The Builder reads the site address from `NEXT_PUBLIC_SITE_URL` (decisions #13) and must emit a canonical link, `og:url`, absolute image URLs and a JSON-LD `url` only when that variable is set. Until the domain is supplied, none of them appear in the built HTML. The OG image is still referenced by a relative path.

Primary search intent: **custom software**, with the three supplied kinds (data recovery tools, card games, Discord bots) as supporting terms.

```yaml
title: "Agkbuilds: Custom software built to fit your business"   # 53/60
description: "Agkbuilds builds custom software, including data recovery tools, card games and Discord bots. Start a conversation by email or phone."   # 133/155
og:
  type: "website"
  title: "Agkbuilds: Custom software, drawn to fit"   # 40
  description: "Custom software planned first, then built around the way your business works. Email agkbuilds@gmail.com or call 254-231-1149."   # 125/155
  image_text: "Custom software, drawn to fit. Then built."   # 7 words, set in Archivo 125 / 800, uppercase, outline to solid
  image_alt: "Agkbuilds: Custom software, drawn to fit. Then built."   # 53/125
twitter:
  card: "summary_large_image"
  title: "Agkbuilds: Custom software, drawn to fit"
  description: "Custom software planned first, then built around the way your business works."
not_found:
  title: "Sheet not found: Agkbuilds"   # 26/60
locale: "en_US"
```

Notes:
- `title` is 53 characters and `description` is 133 characters, both inside the limits, and both contain "custom software".
- The description names only supplied facts: custom software and the three kinds, introduced with "including" so the list is not presented as the full range.
- OG image text is 7 words. The image should show the headline as outlined letters filling solid on the graphite background with the orange dimension line, using the same type as the page.
- Favicon and `icon.svg`: the "A" in a dimension bracket from the direction. No text, no alt needed.

## JSON-LD

`Organization` is the right type: Agkbuilds is a company with no known address, so `LocalBusiness` would need data that was not supplied. Only properties sourced from the supplied facts are used: `name`, `description` (custom software and the three kinds), `email` and `telephone`. There is deliberately no `url`, `founder`, `employee`, `address`, `logo`, `sameAs`, `foundingDate` or `contactPoint`.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Agkbuilds",
  "description": "Agkbuilds builds custom software, including data recovery tools, card games and Discord bots.",
  "email": "agkbuilds@gmail.com",
  "telephone": "+1-254-231-1149"
}
```

## Heading outline

Exactly one `h1`, no skipped levels. The footer has no heading; the 404 page has its own `h1` ("Sheet not found.").

- h1: Custom software, drawn to fit. Then built. (the hero headline; the three display lines are one heading, split with line breaks)
  - h2: What we build
    - h3: Data recovery tools
    - h3: Card games
    - h3: Discord bots
  - h2: How we work
    - h3: Understand
    - h3: Plan
    - h3: Build
    - h3: Hand over
  - h2: Tell us what to build.

If the Director confirms a different hero option, the `h1`, `og:title`, `og:image_text` and `og:image_alt` change with it. The `title` and `description` do not.
