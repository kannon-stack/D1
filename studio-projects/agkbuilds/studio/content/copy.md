# Copy: Agkbuilds

The Builder converts every yaml block below into `src/content/copy.ts`. Keys are slot IDs and match `design/layout-spec.md` exactly. Character counts appear as `# used/budget`.

**Facts used (the only specifics on the page):** custom software; data recovery tools, card games, Discord bots; agkbuilds@gmail.com; 254-231-1149 (`tel:+12542311149`, fixed in the layout spec); Dylan Borgen with no job title. Everything else is general wording.

**Casing:** display text (h1, h2, h3 titles) is written in sentence case and set in uppercase by CSS. Mono `annotate` labels are also written in sentence case, because the `annotate` utility uppercases them.

**Data, not copy:** sheet numbers (01 to 04), the item count, balloon numerals, step numerals, `04 / 04` and the © year are computed by the Builder.

**Mailto:** both buttons link to `mailto:agkbuilds@gmail.com?subject={encodeURIComponent(contact.mail_subject)}`. There is no body, no booking link and no form.

## microcopy
```yaml
sheet: "Sheet"                            # 5/6
nav_label: "Page sections"                # 13/24
wordmark_label: "Agkbuilds, back to the top"   # 26/32
nav:
  - "What we build"                       # 13/14
  - "How we work"                         # 11/14
  - "Contact"                             # 7/14
skip_link: "Skip to content"              # 15/24
not_found:
  title: "Sheet not found."               # 16/28
  body: "That page is not on this drawing. Go back to the first sheet."   # 61/80
  cta: "Back to the first sheet"          # 23/28
  cta_href: "/"
```

Notes:
- `nav` has exactly 3 labels, in order: What we build (`#build`), How we work (`#process`), Contact (`#contact`). The Builder prefixes the section number.
- `not_found` feeds the minimal 404 page. The link is relative, so no domain is needed.

## hero
```yaml
sheet_title: "General arrangement"        # 19/24
headline_options:
  - text: "Custom\nsoftware,\ndrawn to fit.\nThen built."   # 13/13 per line × 4 (6/9/13/11 against 10/10/13/11)
    rationale: "Says custom software in the first two lines, then shows the method: lines 1 to 3 draw as outlines and 'Then built.' fills solid in orange, so the signature moment is the sentence."
    recommended: true
    final: true
  - text: "Custom\nsoftware,\nplanned, then\nbuilt."   # 13/13 per line × 4 (6/9/13/6 against 10/10/13/11)
    rationale: "The method as one plain sentence. The single word 'built.' alone on line 4 is the smallest and loudest orange payoff of the three; it drops the 'fit' idea for the plan-then-build order."
  - text: "Custom\nsoftware.\nName the job.\nWe build."   # 13/13 per line × 4 (6/9/13/9 against 10/10/13/11)
    rationale: "Splits the work in four short beats: you bring the job, Agkbuilds builds it. The most direct and the least about the drawing, so it leans on the buyer rather than the metaphor."
headline: "Custom\nsoftware,\ndrawn to fit.\nThen built."   # 13/13 per line × 4 (6/9/13/11 against 10/10/13/11)
fig_label: "Fig. 01 · Custom software"      # 25/28
drawing_label: "Detail A"                  # 8/16
subhead: "We plan and build software around the way your business works, not the other way around."   # 88/130
cta: "Start a conversation"                # 20/22
cta_hint: "Opens your email app"          # 20/28
```

Notes:
- `headline` is final: the user picked option A (decisions #17), so `headline` equals option A and that option carries `final: true`.
- Every option has "custom software" in lines 1 and 2, no word longer than 9 characters, and a short line 4 for the orange fill.
- `drawing_label` is decorative (the callout on the construction leader, lg and up, `aria-hidden`). `fig_label` is the dimension-line label under the headline.
- `cta_hint` is honest about what the button does and is the button's `aria-describedby`. The CTA's accessible name is its visible text.
- The subhead does not repeat any headline option, so it works with whichever one the user picks.

## build
```yaml
sheet_title: "Parts list"                 # 10/24
title: "What we build"                    # 13/14
intro: "Off-the-shelf software asks you to adapt; custom software is drawn around the work you already do."   # 98/150
col_no: "No."                             # 3/4
col_part: "Part"                          # 4/12
col_description: "Description"            # 11/14
items:
  - name: "Data recovery tools"           # 19/32
    line: "Software that brings back files and data that were deleted, lost or damaged."   # 76/120
  - name: "Card games"                    # 10/32
    line: "Games played with cards, built as software, with every rule of play written into the code."   # 90/120
  - name: "Discord bots"                  # 12/32
    line: "Automated helpers that live in a Discord server and respond to commands from the people there."   # 94/120
count_label: "parts"                      # 5/8
list_end: "End of list"                   # 11/16
```

Notes:
- Exactly the three supplied kinds, in the supplied order. Each line says only what that kind of software is or does in general: no features, formats, success rates, player counts or user numbers.
- The Builder prints the count as `03 parts` (data plus `count_label`).

## process
```yaml
sheet_title: "Method"                     # 6/24
title: "How we work"                      # 11/14
intro: "A drawing comes before the build, and a handover comes after it."   # 64/140
step_label: "Step"                        # 4/6
steps:
  - title: "Understand the job"           # 18/20
    body: "We learn what the software has to do and how your business works today. Questions come before code."   # 99/180
  - title: "Draw the plan"                # 13/20
    body: "We turn what we learned into a plan: what gets built, in what order, and what finished looks like."   # 98/180
  - title: "Build it"                     # 8/20
    body: "We build the software to the plan, one part at a time. What was drawn becomes what runs."   # 88/180
  - title: "Hand it over"                 # 12/20
    body: "The finished software is handed over to you, along with what you need to use it."   # 80/180
figure_caption: "Fig. 02 · One drawing, four passes"   # 34/36
```

Notes:
- Four steps in the order of the plate's layers: measure, plan, build, solid. No timeframes, prices, guarantees or numbers beyond the step order.
- The caption continues the figure numbering from the hero (Fig. 01).

## contact
```yaml
sheet_title: "Title block"                # 11/24
headline: "Tell us\nwhat to\nbuild."      # 7/10 per line × 3
body: "Email or call. Describe what you need the software to do, and the plan starts there."   # 84/140
cta: "Start a conversation"               # 20/22
mail_subject: "Custom software inquiry"   # 23/60
email_label: "Email"                      # 5/10
email: "agkbuilds@gmail.com"              # 19/32
phone_label: "Phone"                      # 5/10
phone: "254-231-1149"                     # 12/16
copy: "Copy"                              # 4/8
copied: "Copied"                          # 6/8
copy_failed: "Couldn’t copy. Text selected: copy it."   # 38/40
copy_email_aria: "Copy email address"     # 18/32
copy_phone_aria: "Copy phone number"      # 17/32
copied_email_announce: "Email address copied."   # 21/40
copied_phone_announce: "Phone number copied."    # 20/40
person_label: "Contact"                   # 7/10
person: "Dylan Borgen"                    # 12/24
drawn_by_label: "Drawn by"                # 8/10
drawn_by: "Agkbuilds"                     # 9/16
```

Notes:
- `contact.cta` is word for word `hero.cta`. Email and phone are two equal cells; the phone link is `tel:+12542311149` with `contact.phone` as its text.
- Copy states: idle `copy`; success shows `copied` for 2400 ms and announces `copied_email_announce` or `copied_phone_announce`; failure selects the text, shows `copy_failed` for 4000 ms and announces it. The visible word "Copy" is contained in both aria labels.
- `person` is the name only. No job title is used anywhere.
- `drawn_by` is the company name; it is the title-block field "Drawn by".

## footer
```yaml
tagline: "Custom software, built for your business."   # 41/56
person: "Dylan Borgen"                    # 12/24
copyright: "Agkbuilds"                    # 9/24
back_to_top: "Back to top"                # 11/16
```

Notes:
- The Builder prints `© {year} {footer.copyright}`; the year is data. The footer email and phone links reuse `contact.email` and `contact.phone`, and the wordmark link uses `microcopy.wordmark_label`.
- No social links, address or legal entity: none were supplied.
