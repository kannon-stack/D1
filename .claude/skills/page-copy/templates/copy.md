# Copy: <Brand>

The Builder converts every yaml block below into `src/content/copy.ts`. Keys are slot IDs. Character counts appear as `# used/budget`.

## hero
```yaml
eyebrow: "<text>"               # 18/32
headline_options:
  - text: "<option A>"          # 19/20 per line × 3
    rationale: "<why>"
    recommended: true
  - text: "<option B>"
    rationale: "<why>"
  - text: "<option C>"
    rationale: "<why>"
headline: "<the chosen option, filled once final>"
subhead: |
  <text>                        # 128/140
cta: "<Verb + outcome>"         # 20/22
cta_loading: "<Starting…>"
```

## <section-id>
```yaml
title: "<text>"
body: |
  <text>
items:
  - title: "<text>"
    body: "<text>"
image_alt: "<what it shows and why>"   # or "" if decorative
```

## microcopy
```yaml
nav:
  - label: "<text>"
    href: "#<section-id>"
skip_link: "Skip to content"
form:
  email_label: "<text>"
  email_help: "<text>"
  email_error_invalid: "<what to do>"
  submit: "<text>"
  submitting: "<text>"
  success: "<text>"
footer:
  legal: "<text>"
```
