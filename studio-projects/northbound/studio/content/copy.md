# Copy: Northbound

The Builder converts every yaml block below into `src/content/copy.ts`. Keys are slot IDs. Character counts appear as `# used/budget`.

**Budgets:** `design/layout-spec.md` is the source of truth for every budget. The second number in each `# used/budget` comment is that spec's figure for the slot. Section titles are budgeted "18 chars × 3 lines", shown as a 54 total with the wrap checked by hand. Counts include spaces; for single-line strings they include `*` markers. The hero headline is counted per line without markers. Where a string holds a `{token}`, the count is as written, and an "expanded" note gives the worst real value.

**Conventions for the Builder**
- `*word*` marks the single italic word in a display line (render as `<em>`; the full stop sits inside it where shown).
- `{token}` marks a value filled in at runtime: `{roast}` "Tue 3 Nov", `{door}` "Fri 6 Nov", `{cutoff}` "Sun 1 Nov, 23:59 ET", `{next_roast}` "Tue 15 Dec", `{n}` stop number, `{count}` stops, `{weeks}` window length (12), `{cadence}` "2 weeks", `{email}` the typed address, `{bags}`, `{style}`, `{price}` from the chosen plan.
- Link arrows (→, ↓) are decorative: add them in markup with `aria-hidden`, not in the strings.
- Use a non-breaking space in "207 °C", "340 g" and "10 minutes 40 seconds". Straight quotes here; typeset them in the build.
- The primary CTA is exactly "Start a subscription" in `hero.cta`, `microcopy.nav_cta`, `roasts.cta` and `microcopy.form.submit`.
- Dates are demo dates: the first stop is Tue 3 Nov 2026 (door Fri 6 Nov, cutoff Sun 1 Nov, 23:59 ET). Batch 214 was roasted Tue 27 Oct.
- Slots that the layout spec lists as "not placed" or "not rendered" (`hero.cta_loading`, `microcopy.theme_to_dark`, `microcopy.theme_to_light`, `how-it-works.route.loading`, `.error`, `.error_action`) are kept so the Builder can use them if that changes.

---

## hero
```yaml
eyebrow: "Small-batch roasters · Marquette, Michigan"   # 42/44 (line 1 of the map legend)
headline_options:
  # The layout spec sets the h1 as a display part (lines 1 and 2, up to 11 chars each) plus a coda (line 3, up to 20 chars).
  # All three options are written to that cut, so any of them can be chosen without a re-layout.
  - text: "Every roast\nis a *climb.*\nWe send you the map."   # lines 11 / 11 / 20 (markers not counted)
    rationale: "Names the concept in one breath, then pays it off with what arrives in the box. The terrain behind the type is the map, so the line and the picture say the same thing inside 5 seconds. The one italic word gives it warmth."
    recommended: true
  - text: "Roasted\nTuesday.\nAt your door *Friday.*"   # lines 7 / 8 / 20 (markers not counted)
    rationale: "The most specific line of the three. It answers the reason people cancel (stale coffee) with two weekdays. It leaves the curve for the subhead, so the map concept takes longer than 5 seconds to land. 'By' is dropped from the earlier draft to fit the 20-character coda."
  - text: "Fresh is\na claim.\nA curve is *proof.*"   # lines 8 / 8 / 17 (markers not counted)
    rationale: "Speaks straight to a reader who distrusts vague quality claims and puts the differentiator in the headline. Colder and less outdoorsy than A, and it takes a small dig at the category, so the warmth has to come from the subhead. 'Roast' moves to the subhead to fit the coda."
headline: "Every roast\nis a *climb.*\nWe send you the map."   # provisional = option A; lines 1 and 2 are the display, line 3 is the coda. The Director confirms, then this is final and option A gets final: true
subhead: "Every bag ships with its real roast curve and roast date, so you can read how it was made before you brew it."   # 109/110
cta: "Start a subscription"   # 20/22
cta_loading: "Starting…"   # 9/22 (not used: the hero CTA is an anchor link)
secondary_cta: "See current roasts"   # 18/20
reassurance: "Roasted Tuesday, at your door by Friday. Pause or skip anytime."   # 63/70
legend: "Contour interval 4 °C · Height = bean temperature"   # 49/52 (line 2 of the map legend)
route_card:
  label: "Current batch"   # 13/16
  batch: "Batch 214"   # 9/10
  origin: "Guji, Ethiopia"   # 14/18
  roasted: "Roasted Tue 27 Oct"   # 18/22
  drop: "Drop 10:40 · 207 °C"   # 19/22
  dtr: "DTR 17%"   # 7/10
  link: "Read this curve"   # 15/18
image_alt: "Contour map drawn from batch 214's bean-temperature data. The summit is the 207 °C drop; a dashed line marks section A–A′."   # 122/125
```

## roast-curve
```yaml
eyebrow: "Section A–A′ · Batch 214"   # 24/44
title: "Every bag carries its own curve"   # 31/54 (18 × 3: "Every bag carries" / "its own curve")
lede: "The contour lines in the hero are batch 214's bean temperature, drawn as terrain. Cut along A–A′ and the map unfolds into the curve we print for you."   # 149/200
date_line: "Roasted Tue 27 Oct 2026"   # 23/30
chart:
  title: "Batch 214 · Guji, Ethiopia · washed"   # 35/44
  definition: "Bean temperature in °C against time in the drum. Left to right is one roast, 10 minutes 40 seconds long."   # 104/120
  x_axis: "Time in drum (min:sec)"   # 22/28
  y_axis: "Bean temperature (°C)"   # 21/28
  cooling_label: "Cooling"   # 7/12
  events:
    - code: "CHARGE"
      name: "Charge"   # 6/14
      time: "0:00"
      temp: ""
      note: "The beans go into the drum."   # 27/80
    - code: "TP"
      name: "Turning point"   # 13/14
      time: "1:05"
      temp: "88 °C"
      note: "The beans have cooled the drum as far as they will. From here it's all climb."   # 77/80
    - code: "DE"
      name: "Dry end"   # 7/14
      time: "4:30"
      temp: "152 °C"
      note: "Moisture is gone and the beans have turned yellow."   # 50/80
    - code: "FC"
      name: "First crack"   # 11/14
      time: "8:50"
      temp: "196 °C"
      note: "The beans crack audibly as steam escapes. Development begins."   # 61/80
    - code: "DROP"
      name: "Drop"   # 4/14
      time: "10:40"
      temp: "207 °C"
      note: "Out of the drum and into the cooling tray."   # 42/80
  phases_title: "Time in each phase"   # 18/28
  phases:
    - name: "Drying"   # 6/12
      time: "4:30"
      share: "42%"
    - name: "Maillard"   # 8/12
      time: "4:20"
      share: "41%"
    - name: "Development"   # 11/12
      time: "1:50"
      share: "17%"
  total: "10:40"
  dtr_label: "DTR 17%"   # 7/10
  dtr_definition: "Development time ratio: the time from first crack to drop, as a share of the whole roast."   # 89/100
image_alt: "Batch 214's roast curve: 88 °C at 1:05, 152 °C at dry end, 196 °C at first crack, 207 °C at the 10:40 drop."   # 107/125
read_label: "How to read it"   # 14/22
annotations:
  - title: "Drying"   # 6/16
    body: "Moisture leaves while the beans warm evenly. Rush it and the cup tastes grassy."   # 79/140
  - title: "Maillard"   # 8/16
    body: "Sugars brown and acids soften. This is where the sweetness is built."   # 68/140
  - title: "Development"   # 11/16
    body: "At 17% this one stays bright and floral. A short development reads brighter, so if your cup tastes sharp, grind a touch finer."   # 126/140
card:
  title: "The curve card"   # 14/22
  caption: "Printed for your exact bag and tucked inside it, so the numbers travel with the coffee."   # 87/110
  lines:
    - "Batch 214 · Guji, Ethiopia · Washed"   # 35/44
    - "Roasted Tue 27 Oct 2026"   # 23/44
    - "Drop 10:40 · 207 °C · DTR 17%"   # 29/44
    - "Peak window Tue 3 Nov to Tue 24 Nov"   # 35/44
    - "Brew V60 · 18 g to 288 g · 93 °C"   # 32/44
    - "Green price paid $6.80/lb"   # 25/44
  image_alt: "The curve card that ships in each bag: batch, roast date, drop temperature, peak window and the full roast curve."   # 113/125
```

## roasts
```yaml
eyebrow: "Current roasts · Roasted Tue 27 Oct"   # 35/44
title: "Three roasts, plotted on one scale"   # 34/54 (18 × 3: "Three roasts," / "plotted on one" / "scale")
lede: "Same temperature axis, same roast-level scale, same fields in the same order. Read across and you can pick by taste, climb or brew method."   # 138/160
labels:
  elevation: "Grown at"   # 8/14
  process: "Process"   # 7/14
  producer: "Producer"   # 8/14
  roast_level: "Roast level"   # 11/14
  drop: "Drop"   # 4/14
  dtr: "DTR"   # 3/14
  first_crack: "First crack"   # 11/14
  notes: "Tasting notes"   # 13/14
  roasted: "Roasted"   # 7/14
  brew: "Suggested brew"   # 14/14
  bag: "Bag"   # 3/14
scale_label: "Roast level"   # 11/14
scale_min: "Light"   # 5/8
scale_max: "Dark"   # 4/8
scale_note: "Placed by drop temperature and DTR."   # 35/60
items:
  # Order is light to dark, so the row reads as a gradient. Batch numbers and curve data match the Designer's
  # mini-212 / mini-213 / mini-214 profiles in design/assets/contours.mjs. drop, drop_time and dtr are data.
  - batch: "Batch 212"   # 9/10
    name: "Nyeri"   # 5/12
    country: "Kenya"   # 5/12
    latitude: "0.4°S"   # 5/8
    elevation: "1,800 m"   # 7/14
    producer: "Gikira Factory"   # 14/32
    process: "Washed"   # 6/12
    roast_level: "Light"   # 5/14
    drop: "203 °C"
    drop_time: "10:10"
    dtr: "15%"
    first_crack: "8:40 · 194 °C"   # 13/16
    notes:
      - "Blackcurrant"   # 12/16
      - "Grapefruit"   # 10/16
      - "Brown sugar"   # 11/16
    roasted: "Tue 27 Oct"   # 10/12
    brew: "Chemex · 1:15 · 94 °C"   # 21/36
    bag: "340 g · $26"   # 11/16
    mini_alt: "Batch 212's roast curve on the shared axis: drops at 203 °C after 10:10, the lowest and shortest of the three."   # 110/125
  - batch: "Batch 214"   # 9/10
    name: "Guji"   # 4/12
    country: "Ethiopia"   # 8/12
    latitude: "5.9°N"   # 5/8
    elevation: "2,000 m"   # 7/14
    producer: "Wachu Hora washing station"   # 26/32
    process: "Washed"   # 6/12
    roast_level: "Light-medium"   # 12/14
    drop: "207 °C"
    drop_time: "10:40"
    dtr: "17%"
    first_crack: "8:50 · 196 °C"   # 13/16
    notes:
      - "Jasmine"   # 7/16
      - "Bergamot"   # 8/16
      - "White peach"   # 11/16
    roasted: "Tue 27 Oct"   # 10/12
    brew: "V60 · 1:16 · 93 °C"   # 18/36
    bag: "340 g · $24"   # 11/16
    mini_alt: "Batch 214's roast curve on the shared axis: drops at 207 °C after 10:40, the middle of the three."   # 97/125
  - batch: "Batch 213"   # 9/10
    name: "Huila"   # 5/12
    country: "Colombia"   # 8/12
    latitude: "2.0°N"   # 5/8
    elevation: "1,750 m"   # 7/14
    producer: "Finca Alto Pinar"   # 16/32
    process: "Honey"   # 5/12
    roast_level: "Medium"   # 6/14
    drop: "212 °C"
    drop_time: "11:20"
    dtr: "20%"
    first_crack: "9:05 · 197 °C"   # 13/16
    notes:
      - "Red apple"   # 9/16
      - "Cacao nib"   # 9/16
      - "Caramel"   # 7/16
    roasted: "Tue 27 Oct"   # 10/12
    brew: "Espresso · 18 g in, 40 g out, 28 s"   # 34/36
    bag: "340 g · $22"   # 11/16
    mini_alt: "Batch 213's roast curve on the shared axis: drops at 212 °C after 11:20, the highest and longest of the three."   # 110/125
price_note: "Prices are for one-off bags. On a plan, every bag costs $19 to $21."   # 67/90
cta: "Start a subscription"   # 20/22
```

## how-it-works
```yaml
eyebrow: "Route schedule"   # 14/44
title: "Plot your route. Skip any stop."   # 31/54 (18 × 3: "Plot your route." / "Skip any stop.")
lede: "We roast on Tuesdays and ship within 24 hours, so every bag reaches you by Friday. Choose how often. Change any stop until Sunday 23:59 ET."   # 139/160
steps:
  - day: "Sun"   # 3/3
    title: "Your last call"   # 14/22
    body: "Until 23:59 ET you can skip, pause, swap the coffee or change the bag size for that week's roast."   # 97/100
  - day: "Tue"   # 3/3
    title: "We roast"   # 8/22
    body: "Your coffee goes into the drum. The curve is logged second by second."   # 69/100
  - day: "Wed"   # 3/3
    title: "We ship"   # 7/22
    body: "Packed and handed to the carrier within 24 hours of the drop, roast date on the bag."   # 84/100
  - day: "Fri"   # 3/3
    title: "At your door"   # 12/22
    body: "At most 3 days from drop to doorstep. The card tells you when it peaks."   # 71/100
promise_label: "Freshness promise"   # 17/22
promise: "At your door within 3 days of the roast, or your next bag is on us."   # 67/90
route:
  region_label: "Your route"   # 10/28
  cadence_legend: "Deliver every"   # 13/22
  cadence_options:
    - value: 1
      label: "1 week"   # 6/10
    - value: 2
      label: "2 weeks"   # 7/10
    - value: 3
      label: "3 weeks"   # 7/10
    - value: 4
      label: "4 weeks"   # 7/10
  instructions: "Choose a rhythm, then tap a stop to skip it. Nothing is final until you subscribe."   # 82/90
  keyboard_hint: "Tab to a stop, then press Enter to skip or restore it."   # 54/90 (screen readers)
  window_label: "Your next deliveries"   # 20/28
  legend:
    roast: "Roast day, Tuesday"   # 18/22
    door: "At your door, Friday"   # 20/22
    skipped: "Skipped"   # 7/22
  stop_label: "Stop {n}"
  stop_roast: "Roasts {roast}"
  stop_door: "At your door {door}"
  stop_cutoff: "Change until {cutoff}"
  # The four stop strings joined with " · " run 89 characters at worst (spec: 110 on one line at lg).
  skip_button: "Skip"   # 4/10
  skip_aria: "Skip the {roast} delivery"
  restore_button: "Restore"   # 7/10
  restore_aria: "Restore the {roast} delivery"
  skipped_label: "Skipped"   # 7/10
  skipped_note: "Skipped. Your next bag roasts {next_roast}."   # expanded 41/80
  restored_note: "Restored. Roasts {roast}, at your door {door}."   # expanded 54/80
  locked_label: "Locked"   # 6/10
  locked_note: "Sunday's cutoff has passed, so this bag roasts as planned."   # 58/80
  holiday_note: "Christmas falls on a Friday, so this one arrives Thu 24 Dec."   # 60/80
  summary: "{count} deliveries in the next {weeks} weeks. Next roast {roast}."   # expanded 58/80
  summary_one: "1 delivery in the next {weeks} weeks. Next roast {roast}."   # expanded 55/80
  loading: "Plotting your route…"   # 20/28 (not rendered: the schedule is computed synchronously)
  error: "Couldn't redraw your route. Nothing has changed, so try again."   # 62/80 (not rendered)
  error_action: "Try again"   # 9/16 (not rendered)
  empty_title: "Route paused"   # 12/22
  empty_body: "Every stop is skipped, so nothing ships. Restore a stop to start again, or choose a new rhythm."   # 95/100
  empty_action: "Restore all stops"   # 17/22
  announce_cadence: "Route redrawn. Delivering every {cadence}, {count} stops in the next {weeks} weeks."
  announce_skipped: "Skipped the {roast} delivery. Next roast {next_roast}."
  announce_restored: "Restored the {roast} delivery."
  announce_paused: "All stops skipped. Route paused."
  noscript: "The route schedule needs JavaScript. In short: we roast Tuesday, ship Wednesday and reach you by Friday, and you can change any delivery until Sunday 23:59 ET."   # 159/170
# Worked example (cadence 2 weeks, the Dec 1 stop skipped, 12-week window):
#   Stop 1  Roasts Tue 3 Nov, at your door Fri 6 Nov, Change until Sun 1 Nov, 23:59 ET   [Skip]
#   Stop 2  Roasts Tue 17 Nov, at your door Fri 20 Nov                                    [Skip]
#   Stop 3  Skipped. Your next bag roasts Tue 15 Dec.                                     [Restore]
#   Stop 4  Roasts Tue 15 Dec, at your door Fri 18 Dec                                    [Skip]
#   Stop 5  Roasts Tue 29 Dec, at your door Fri 1 Jan                                     [Skip]
#   Stop 6  Roasts Tue 12 Jan, at your door Fri 15 Jan                                    [Skip]
#   Summary: "5 deliveries in the next 12 weeks. Next roast Tue 3 Nov."
```

## proof
```yaml
eyebrow: "On the record"   # 13/44
title: "From washing station to kettle"   # 30/54 (18 × 3: "From washing" / "station to kettle")
sourcing:
  label: "Sourcing"   # 8/16
  headline: "Four harvests, one washing station"   # 34/40
  body: "We've bought Guji from the Wachu Hora washing station since 2022. The price is agreed before picking starts: $6.80 a pound of green coffee, printed on the card in your bag."   # 172/200
quote:
  label: "Customer"   # 8/16
  text: "Two other subscriptions went stale on me. This bag arrived three days off the roast, and the curve explained why my first cup was sharp. I ground finer and the peach showed up."   # 176/180
  name: "Hannah Lindqvist"   # 16/24
  place: "Duluth, Minnesota"   # 17/24
  method: "Hario V60, 1:16"   # 15/24
stat:
  value: "2.6 days"   # 8/8
  label: "Average time from roast to door, September 2026 deliveries"   # 58/70
```

## subscribe
```yaml
eyebrow: "Next roast Tue 3 Nov · join by Sun 1 Nov"   # 40/44
title: "From $19 a bag. Skip any week."   # 30/54 (18 × 3: "From $19 a bag." / "Skip any week.")
lede: "Pick a bag count and a rhythm. Every delivery includes the curve card, the roast date and shipping."   # 99/160
plans_legend: "Bags per delivery"   # 17/22
plans:
  - name: "1 bag"   # 5/12
    price: "$21"   # 3/6
    price_unit: "per delivery"   # 12/16
    per_bag: "$21 a bag"   # 9/16
    fit: "About 18 brews per delivery"   # 27/36
  - name: "2 bags"   # 6/12
    price: "$40"   # 3/6
    price_unit: "per delivery"   # 12/16
    per_bag: "$20 a bag"   # 9/16
    fit: "About 36 brews per delivery"   # 27/36
    default: true
  - name: "4 bags"   # 6/12
    price: "$76"   # 3/6
    price_unit: "per delivery"   # 12/16
    per_bag: "$19 a bag"   # 9/16
    fit: "About 72 brews per delivery"   # 27/36
bag_note: "Each bag is 340 g (12 oz). Brew counts assume an 18 g dose."   # 59/80
selected_label: "Selected"   # 8/12
cadence_legend: "Deliver every"   # 13/22
cadence_options:
  - value: 1
    label: "1 week"   # 6/10
  - value: 2
    label: "2 weeks"   # 7/10
    default: true
  - value: 3
    label: "3 weeks"   # 7/10
  - value: 4
    label: "4 weeks"   # 7/10
style_legend: "What do you brew with?"   # 22/28
styles:
  - value: "filter"
    label: "Filter"   # 6/12
    body: "A rotating single origin, roasted for pour-over and batch brew."   # 63/80
    default: true
  - value: "espresso"
    label: "Espresso"   # 8/12
    body: "A single origin roasted a touch deeper, with a dialing-in recipe on the card."   # 77/80
plan_summary_label: "Your plan"   # 9/16
plan_summary: "{bags} every {cadence}, {style}. {price} per delivery."   # expanded 49/80, e.g. "4 bags every 4 weeks, espresso. $76 per delivery."
included_title: "Every delivery includes"   # 23/28
included:
  - "A curve card for every bag, with the full roast"   # 47/60
  - "A roast date no more than 3 days old at your door"   # 49/60
  - "Shipping included on every plan"   # 31/60
  - "Skip, pause, swap or resize until Sunday 23:59 ET"   # 49/60
reassurance: "Pause or skip anytime."   # 22/28
closing: "The next climb goes into the drum Tuesday."   # 42/48
```

## footer
```yaml
wordmark: "Northbound"   # 10/12 (set in caps by the Designer)
tagline: "Every roast is a *climb.*"   # 25/32 (markers counted; the layout spec italicizes the marked word)
location_label: "The roastery"   # 12/16
location: "Marquette, Michigan"   # 19/32
coordinates: "46.5°N 87.4°W"   # 13/20
schedule: "We roast on Tuesdays and ship within 24 hours."   # 46/60
contact_label: "Say hello"   # 9/16
email: "hello@northbound.example"   # 24/32
map_credit: "Terrain computed from the bean-temperature log of batch 214, roasted Tue 27 Oct 2026."   # 85/100
demo_note: "Northbound is a fictional brand made for a design demo. Nothing here ships."   # 75/90
```

## microcopy
```yaml
nav:
  - label: "Roasts"   # 6/14
    href: "#roasts"
  - label: "The curve"   # 9/14
    href: "#roast-curve"
  - label: "How it works"   # 12/14
    href: "#how-it-works"
  - label: "Plans"   # 5/14
    href: "#subscribe"
nav_cta: "Start a subscription"   # 20/22
nav_label: "Main"
skip_link: "Skip to content"   # 15/22
menu_open: "Menu"   # 4/6
menu_close: "Close menu"   # 10/12
theme_to_dark: "Switch to dark scheme"   # 21/28 (not placed: the layout has no manual toggle)
theme_to_light: "Switch to light scheme"   # 22/28 (not placed: the layout has no manual toggle)
form:
  email_label: "Email address"   # 13/22
  email_placeholder: "name@example.com"   # 16/28
  email_help: "For your confirmation and a link to change your route. No marketing."   # 68/80
  email_error_empty: "Add your email address to start your plan."   # 42/80
  email_error_invalid: "That address looks unfinished. Try the form name@example.com."   # 61/80
  submit: "Start a subscription"   # 20/22
  submitting: "Starting…"   # 9/22
  success_title: "You're on the route."   # 20/28
  success: "Your first bag roasts Tue 3 Nov and should reach you by Fri 6 Nov. Confirmation goes to {email}. Change anything until Sun 1 Nov, 23:59 ET."   # 139/160 with {email} as 7 chars; fits addresses up to 28 characters
  error_submit: "We couldn't save your plan, and nothing was charged. Try again in a minute."   # 75/100
  retry: "Try again"   # 9/16
  demo_note: "Demo page: this form checks your email but sends nothing and takes no payment."   # 78/90
footer:
  legal: "© 2026 Northbound Coffee Roasters"   # 33/48
not_found:
  title: "Off the map"   # 11/28
  body: "That page isn't on any route we've surveyed. The link may have moved or lost a piece."   # 85/100
  link: "Back to the trailhead"   # 21/28
decorative_alt: ""   # contour terrain used purely as background elsewhere on the page: decorative, aria-hidden
```
