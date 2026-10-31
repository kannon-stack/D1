// From studio/content/metadata.md.
export const site = {
  url: "https://northbound.example",
  canonicalPath: "/",
  title: "Coffee subscription with roast curves | Northbound Coffee",
  description:
    "Small-batch coffee roasted every Tuesday. Each bag ships with its real roast curve and roast date. Skip or pause anytime. Plans from $19 a bag.",
  locale: "en_US",
  notFoundTitle: "Off the map | Northbound",
  og: {
    siteName: "Northbound Coffee Roasters",
    title: "Every roast is a climb. We send you the map.",
    description:
      "A coffee subscription where every bag ships with the real curve it was roasted on, plus the date. Roasted Tuesday, at your door by Friday.",
    imageText: "Every roast is a climb.",
    imageAlt: "Contour lines rising to a summit labeled 207°, with the words Every roast is a climb.",
  },
} as const;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://northbound.example/#organization",
      name: "Northbound Coffee Roasters",
      url: "https://northbound.example/",
      email: "hello@northbound.example",
      description:
        "Small-batch coffee roasters in Marquette, Michigan. Every bag ships with its real roast curve and roast date.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Marquette",
        addressRegion: "MI",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 46.5436, longitude: -87.3954 },
    },
    {
      "@type": "Product",
      "@id": "https://northbound.example/#subscription",
      name: "Northbound coffee subscription",
      description:
        "340 g bags of small-batch coffee roasted every Tuesday and shipped within 24 hours. Each bag comes with its real roast curve and roast date. Skip or pause anytime.",
      image: "https://northbound.example/og-image.png",
      category: "Coffee subscription",
      brand: { "@id": "https://northbound.example/#organization" },
      offers: [
        { "@type": "Offer", name: "1 bag (340 g) per delivery", price: "21.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: "https://northbound.example/#subscribe" },
        { "@type": "Offer", name: "2 bags (680 g) per delivery", price: "40.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: "https://northbound.example/#subscribe" },
        { "@type": "Offer", name: "4 bags (1,360 g) per delivery", price: "76.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: "https://northbound.example/#subscribe" },
      ],
    },
  ],
};
