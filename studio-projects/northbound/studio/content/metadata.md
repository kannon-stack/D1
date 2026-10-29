# Metadata: Northbound

Primary search intent: "coffee subscription", with the differentiator (roast curve) alongside. The OG title follows the hero headline; if the Director confirms a different hero option, update `og.title` and `og.image_text` to match.

```yaml
title: "Coffee subscription with roast curves | Northbound Coffee"   # 57/60
description: "Small-batch coffee roasted every Tuesday. Each bag ships with its real roast curve and roast date. Skip or pause anytime. Plans from $19 a bag."   # 143/155
og:
  type: "website"
  site_name: "Northbound Coffee Roasters"
  title: "Every roast is a climb. We send you the map."   # 44/60
  description: "A coffee subscription where every bag ships with the real curve it was roasted on, plus the date. Roasted Tuesday, at your door by Friday."   # 138/200
  image_text: "Every roast is a climb."   # 5 words of 8 (set in the display face, Archivo wdth 125)
  image_alt: "Contour lines rising to a summit labeled 207°, with the words Every roast is a climb."   # 85/125
twitter_card: "summary_large_image"
locale: "en_US"
canonical_path: "/"
not_found_title: "Off the map | Northbound"   # 24/60
```

## JSON-LD

Type: `Organization` plus a `Product` for the subscription. `LocalBusiness` is wrong here: the roastery is not a storefront open to visitors. The domain `northbound.example` is a reserved demo domain, because the brand is fictional. No ratings or reviews are included, since none exist.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://northbound.example/#organization",
      "name": "Northbound Coffee Roasters",
      "url": "https://northbound.example/",
      "email": "hello@northbound.example",
      "description": "Small-batch coffee roasters in Marquette, Michigan. Every bag ships with its real roast curve and roast date.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Marquette",
        "addressRegion": "MI",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 46.5436,
        "longitude": -87.3954
      }
    },
    {
      "@type": "Product",
      "@id": "https://northbound.example/#subscription",
      "name": "Northbound coffee subscription",
      "description": "340 g bags of small-batch coffee roasted every Tuesday and shipped within 24 hours. Each bag comes with its real roast curve and roast date. Skip or pause anytime.",
      "image": "https://northbound.example/og-image.png",
      "category": "Coffee subscription",
      "brand": {
        "@id": "https://northbound.example/#organization"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "1 bag (340 g) per delivery",
          "price": "21.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://northbound.example/#subscribe"
        },
        {
          "@type": "Offer",
          "name": "2 bags (680 g) per delivery",
          "price": "40.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://northbound.example/#subscribe"
        },
        {
          "@type": "Offer",
          "name": "4 bags (1,360 g) per delivery",
          "price": "76.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://northbound.example/#subscribe"
        }
      ]
    }
  ]
}
```

## Heading outline
One `h1`, no skipped levels. The hero eyebrow, the "Section A–A′" eyebrow, the route-schedule legends and the plan labels are not headings.

- h1: Every roast is a climb. We send you the map. (hero headline; line breaks are visual only)
  - h2: Every bag carries its own curve (`roast-curve`)
    - h3: Drying
    - h3: Maillard
    - h3: Development
    - h3: The curve card
  - h2: Three roasts, plotted on one scale (`roasts`)
    - h3: Nyeri (Kenya)
    - h3: Guji (Ethiopia)
    - h3: Huila (Colombia)
  - h2: Plot your route. Skip any stop. (`how-it-works`)
    - h3: Your last call (Sun)
    - h3: We roast (Tue)
    - h3: We ship (Wed)
    - h3: At your door (Fri)
  - h2: From washing station to kettle (`proof`)
    - h3: Four harvests, one washing station
    - (the customer quote is a `blockquote` with a `cite`, not a heading)
  - h2: From $19 a bag. Skip any week. (`subscribe`)
    - h3: Every delivery includes
  - Footer: no heading; a `footer` landmark with the wordmark as a link to the top.
