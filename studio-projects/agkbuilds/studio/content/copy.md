# Copy: Agkbuilds

The Builder converts every yaml block below into `src/content/copy.ts`. Keys are slot IDs. Character counts appear as `# used/budget`.

**Status:** budgets are the working ones from `design/directions.md` (build item name <= 32, one line <= 120, process step title <= 20 plus 1 to 2 sentences, subhead <= 140). `design/layout-spec.md` did not exist when this was written; when it lands, re-fit any slot whose budget differs.

**Facts used (the only specifics on the page):** custom software; data recovery tools, card games, Discord bots; agkbuilds@gmail.com; 254-231-1149 (`tel:+12542311149`); Dylan Borgen with no job title. Everything else is general wording.

**Single source for contact facts:** the `contact` block holds the email, subject line, phone number and `tel:` link. Hero, footer and microcopy reuse them.

**Build-time token:** `{year}` in `footer.legal` is replaced with the current year when the page is built.

**Display casing:** headings are written in sentence case. The display face sets them in uppercase with CSS. Mono annotations are written in uppercase.

## hero
```yaml
sheet_label: "SHEET 1/4"                  # 9/12
wordmark_main: "AGK"                      # 3/6
wordmark_sub: "builds"                    # 6/10
wordmark_aria: "Agkbuilds"
fig_label: "FIG. 01: CUSTOM SOFTWARE"    # 24/32
dimension_label: "built"                  # 5/12
headline_options:
  - text: "Custom software,\ndrawn to fit.\nThen built."   # 16/18 per line × 3
    rationale: "States the category in line one, then shows the method. The outline draws first and the solid fill lands on 'Then built.', so the signature moment is the sentence."
    recommended: true
  - text: "We build custom\nsoftware around\nyour business."   # 15/18 per line × 3
    rationale: "The plainest option: who does what, readable in one glance. Loses the drawing metaphor in words, so the outline-to-solid fill has to carry it alone."
  - text: "Custom software\nfrom first line\nto final build."   # 15/18 per line × 3
    rationale: "A line on the sheet and a line of code, through to the finished build. Three equal 15-character lines let the dimension line span the headline evenly."
headline: "Custom software,\ndrawn to fit.\nThen built."   # 16/18 per line × 3
subhead: "You name the job. We plan it, build it and hand over software that fits the way your business works."   # 100/140
cta: "Start a conversation"                # 20/22
cta_pressed: "Opening your email…"        # 19/22
cta_aria: "Start a conversation, opens an email to agkbuilds@gmail.com"
phone_text: "Call 254-231-1149"           # 17/22
drawing_alt: ""
```

Notes for hero:
- `headline` is provisional and equals the recommended option A. When the Director confirms a pick, copy that option's text into `headline` and add `final: true` to the chosen option.
- `drawing_alt` is empty on purpose: the construction circles, dimension line and FIG. label are decorative and `aria-hidden`. The real headline text carries the meaning.
- `phone_text` is the visible text of the `tel:` link; its accessible name is the visible text, so no `aria-label` is set. The href is `contact.phone_href`.

## build
```yaml
sheet_label: "SHEET 2/4"                  # 9/12
label: "PARTS LIST"                       # 10/16
title: "What we build"                    # 13/24
intro: "Off-the-shelf software asks you to adapt; custom software is drawn around the work you already do."   # 98/120
items:
  - code: "01"                            # 2/4
    title: "Data recovery tools"          # 19/32
    body: "Software that brings back files and data that were deleted, lost or damaged."   # 76/120
  - code: "02"                            # 2/4
    title: "Card games"                   # 10/32
    body: "Games played with cards, built as software, with every rule of play written into the code."   # 90/120
  - code: "03"                            # 2/4
    title: "Discord bots"                 # 12/32
    body: "Automated helpers that live in a Discord server and respond to commands from the people there."   # 94/120
outro: "Something else in mind? Describe it and we will tell you whether it is a fit."   # 77/100
```

Notes for build:
- Each line says only what that kind of software is or does in general. No features, formats, success rates, player counts or user numbers.
- `outro` is optional. It invites other ideas without promising to build them. Cut it if the Director prefers the list to stay at exactly the three supplied kinds.

## process
```yaml
sheet_label: "SHEET 3/4"                  # 9/12
title: "How we work"                      # 11/24
intro: "A drawing comes before the build, and a handover comes after it."   # 64/100
steps:
  - code: "STEP 1/4"                      # 8/10
    title: "Understand"                   # 10/20
    body: "We learn what the software has to do and how your business works today. Questions come before code."   # 99/160
    stage: "LINES"                        # 5/16
  - code: "STEP 2/4"                      # 8/10
    title: "Plan"                         # 4/20
    body: "We turn what we learned into a plan: what gets built, in what order, and what finished looks like. This is the drawing."   # 119/160
    stage: "DIMENSIONED"                  # 11/16
  - code: "STEP 3/4"                      # 8/10
    title: "Build"                        # 5/20
    body: "We build the software to the plan, one part at a time. What was drawn becomes what runs."   # 88/160
    stage: "DETAILED"                     # 8/16
  - code: "STEP 4/4"                      # 8/10
    title: "Hand over"                    # 9/20
    body: "The finished software is handed over to you, along with what you need to use it."   # 80/160
    stage: "SOLID"                        # 5/16
drawing_alt: ""
```

Notes for process:
- No timeframes, prices, guarantees or numbers beyond the step order.
- `stage` is the mono caption for the scroll-linked drawing as it gains detail (lines only, dimensioned, detailed, solid). Optional; drop it if the layout spec has no slot for it.
- `drawing_alt` is empty on purpose: the scroll-linked drawing is decorative and `aria-hidden`.
- The mono code is "STEP n/4" (not "SHEET n/4") so it does not repeat the page-level sheet labels. Sheet labels: hero 1/4, build 2/4, process 3/4, contact 4/4.

## contact
```yaml
sheet_label: "SHEET 4/4"                  # 9/12
title: "Tell us what to build."           # 22/28
body: "Email or call. Describe what you need the software to do, and the plan starts there."   # 84/110
cta: "Start a conversation"               # 20/22
cta_pressed: "Opening your email…"        # 19/22
cta_aria: "Start a conversation, opens an email to agkbuilds@gmail.com"
email: "agkbuilds@gmail.com"              # 19/32
email_subject: "Custom software inquiry"  # 23/40
email_body: "Hello Agkbuilds,\n\nHere is what I need the software to do:\n\n"
phone: "254-231-1149"                     # 12/16
phone_href: "tel:+12542311149"
block_drawn_for_label: "DRAWN FOR"        # 9/12
block_drawn_for_value: "You"              # 3/12
block_contact_label: "CONTACT"            # 7/12
block_contact_value: "Dylan Borgen"       # 12/24
block_email_label: "EMAIL"                # 5/12
block_phone_label: "PHONE"                # 5/12
block_next_label: "NEXT STEP"             # 9/12
```

Notes for contact:
- The title block reads: DRAWN FOR: You, CONTACT: Dylan Borgen (name only, no title), EMAIL, PHONE, NEXT STEP with the primary button. Email and phone are two equal ways to reach Agkbuilds.
- The button is a `mailto:` link built from `email`, `email_subject` and `email_body` (the Builder URL-encodes them). There is no booking link and no form.
- The email address is also printed as selectable text with the copy button (states in `microcopy.copy_email`).

## footer
```yaml
wordmark_main: "AGK"                      # 3/6
wordmark_sub: "builds"                    # 6/10
wordmark_aria: "Agkbuilds"
description: "Custom software, built for your business."   # 41/60
contact_label: "Contact"                  # 7/16
contact_name: "Dylan Borgen"              # 12/24
email: "agkbuilds@gmail.com"              # 19/32
phone: "254-231-1149"                     # 12/16
legal: "© {year} Agkbuilds"               # 18/24
back_to_top: "Back to top"                # 11/16
back_to_top_aria: "Back to top of page"
end_mark: "END OF DRAWING"                # 14/20
```

Notes for footer:
- The footer email and phone link to the same `mailto:` and `tel:` targets as the contact block. No social links, address or legal entity: none were supplied.

## microcopy
```yaml
skip_link: "Skip to content"              # 15/24
nav:
  - label: "Start a conversation"         # 20/22
    href: "mailto:agkbuilds@gmail.com"
    aria: "Start a conversation, opens an email to agkbuilds@gmail.com"
email_link:
  hint: "Opens your email app, addressed to Agkbuilds."   # 45/60
  fallback: "No email app opened? Copy the address instead."   # 46/60
copy_email:
  label: "Copy"                           # 4/12
  aria: "Copy email address"
  done: "Copied"                          # 6/12
  done_announce: "Email address copied."
  failed: "Couldn’t copy"                 # 13/16
  failed_help: "Select the address and copy it by hand."   # 39/48
  failed_announce: "Couldn’t copy the address. Select it and copy it by hand."
phone_link:
  aria: "Call Agkbuilds at 254-231-1149"
  hint: "On a phone, tap to call."        # 24/32
theme_toggle:
  to_light: "Switch to light theme"       # 21/28
  to_dark: "Switch to dark theme"         # 20/28
not_found:
  title: "Sheet not found."               # 16/28
  body: "That page is not on this drawing. Go back to the first sheet."   # 61/80
  cta: "Back to the first sheet"          # 23/28
  cta_href: "/"
```

Notes for microcopy:
- Copy button: idle shows "Copy"; on success it shows "Copied" for about 2 seconds, announces `done_announce` in a polite live region, then returns to "Copy". On failure it shows "Couldn’t copy" with `failed_help` beneath it and announces `failed_announce`. The button stays focusable in every state.
- `nav` is the slim bar in the hero: wordmark and the same primary button. It is a `mailto:` link like the hero and contact buttons, so the wording is identical in all three places.
- `phone_link.aria` is optional and only for the contact and footer links, whose visible text is the bare number; it contains that number, so the accessible name still matches what is shown. The hero link needs no `aria-label` because its visible text ("Call 254-231-1149") is already the name. `hint` is optional helper text beside the number.
- `theme_toggle` is only needed if the layout spec includes a manual scheme toggle (dark is the home look).
- `not_found` is used by the static 404 page. Its link is relative so no domain is needed.
- Reduced motion needs no copy: the finished drawing is shown still.
- Form labels, placeholders, validation and success messages: not applicable. There is no form.
