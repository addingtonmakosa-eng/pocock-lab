// Frames for the race chart, built from ride rows: [{ date, city, rides }, ...].

// One frame per date, ascending: { date, cities: [{ city, rides }, ...], leader, lead }
// with rides cumulative up to and including that date and cities in rank order.
// Every frame has every city; a city with no ride row on a date keeps its
// cumulative rides.
// leader is the top-ranked city and lead how far it is ahead of the second-ranked
// city; a tied frame has neither, and a single city leads with no lead.
// max is the highest cumulative rides in the last frame, for scaling bars.
export function raceFrames(rows) {
  const byDate = new Map();
  for (const row of rows) {
    if (!byDate.has(row.date)) byDate.set(row.date, []);
    byDate.get(row.date).push(row);
  }
  // Every city starts at 0 so it appears in every frame, even before its first ride row.
  const totals = new Map(rows.map((row) => [row.city, 0]));
  const frames = [...byDate.keys()].sort().map((date) => {
    for (const row of byDate.get(date)) {
      totals.set(row.city, totals.get(row.city) + Number(row.rides));
    }
    const cities = [...totals.entries()]
      .map(([city, rides]) => ({ city, rides }))
      .sort((a, b) => b.rides - a.rides || a.city.localeCompare(b.city));
    return { date, cities, ...leaderAndLead(cities) };
  });
  const max = frames.at(-1)?.cities[0]?.rides ?? 0;
  return { frames, max };
}

function leaderAndLead([first, second]) {
  if (!second) return { leader: first.city, lead: null };
  if (first.rides === second.rides) return { leader: null, lead: null };
  return { leader: first.city, lead: first.rides - second.rides };
}
