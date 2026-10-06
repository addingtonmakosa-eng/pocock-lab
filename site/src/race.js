// Frames for the race chart, built from ride rows: [{ date, city, rides }, ...].

// One frame per date, ascending: { date, cities: [{ city, rides }, ...] } with rides
// cumulative up to and including that date and cities in rank order. Every frame
// has every city; a city with no ride row on a date keeps its cumulative rides.
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
    return {
      date,
      cities: [...totals.entries()]
        .map(([city, rides]) => ({ city, rides }))
        .sort((a, b) => b.rides - a.rides || a.city.localeCompare(b.city)),
    };
  });
  const max = frames.at(-1)?.cities[0]?.rides ?? 0;
  return { frames, max };
}
