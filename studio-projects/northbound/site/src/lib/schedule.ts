// Deterministic demo schedule (layout-spec, how-it-works "Logic").
// Week k = 0…11. Roast = Tue 3 Nov 2026 + 7k days. Door = roast + 3 (Fri), except
// Fri 25 Dec → Thu 24 Dec. Cutoff = roast − 2 (Sun), 23:59 ET.
export const WEEKS = 12;
const ANCHOR = Date.UTC(2026, 10, 3); // Tue 3 Nov 2026
const DAY = 86_400_000;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Week = {
  k: number;
  roast: Date;
  door: Date;
  cutoff: Date;
  holiday: boolean;
  /** The demo anchor puts every cutoff in the future, so nothing is locked. */
  locked: boolean;
};

const at = (k: number, offset: number) => new Date(ANCHOR + (7 * k + offset) * DAY);

export const weeks: Week[] = Array.from({ length: WEEKS }, (_, k) => {
  const roast = at(k, 0);
  let door = at(k, 3);
  const holiday = door.getUTCMonth() === 11 && door.getUTCDate() === 25;
  if (holiday) door = at(k, 2);
  return { k, roast, door, cutoff: at(k, -2), holiday, locked: false };
});

export const fmt = {
  /** "Tue 3 Nov" */
  long: (d: Date) => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`,
  /** "Fri 6" */
  short: (d: Date) => `${WD[d.getUTCDay()]} ${d.getUTCDate()}`,
  /** "Sun 1 Nov, 23:59 ET" */
  cutoff: (d: Date) => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}, 23:59 ET`,
  day: (d: Date) => String(d.getUTCDate()),
  month: (d: Date) => MO[d.getUTCMonth()].toUpperCase(),
};

/** True for the first station of each month (and station 0). */
export const startsMonth = (k: number) =>
  k === 0 || weeks[k].roast.getUTCMonth() !== weeks[k - 1].roast.getUTCMonth();

export const deliveryWeeks = (cadence: number) => weeks.filter((w) => w.k % cadence === 0);
