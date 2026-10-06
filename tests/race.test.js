import { test } from "node:test";
import assert from "node:assert/strict";
import { raceFrames } from "../site/src/race.js";

test("raceFrames gives each city's cumulative rides up to and including the frame's date", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-02", city: "Miami", rides: 5 },
    { date: "2026-07-03", city: "Miami", rides: 7 },
  ]);
  assert.deepEqual(frames, [
    { date: "2026-07-01", cities: [{ city: "Miami", rides: 10 }], leader: "Miami", lead: null },
    { date: "2026-07-02", cities: [{ city: "Miami", rides: 15 }], leader: "Miami", lead: null },
    { date: "2026-07-03", cities: [{ city: "Miami", rides: 22 }], leader: "Miami", lead: null },
  ]);
});

test("raceFrames has one frame per date, in ascending order, whatever order the ride rows are in", () => {
  const { frames } = raceFrames([
    { date: "2026-07-02", city: "Boston", rides: "30" },
    { date: "2026-07-01", city: "Miami", rides: "10" },
    { date: "2026-07-02", city: "Miami", rides: "5" },
    { date: "2026-07-01", city: "Boston", rides: "20" },
  ]);
  assert.deepEqual(frames, [
    {
      date: "2026-07-01",
      cities: [
        { city: "Boston", rides: 20 },
        { city: "Miami", rides: 10 },
      ],
      leader: "Boston",
      lead: 10,
    },
    {
      date: "2026-07-02",
      cities: [
        { city: "Boston", rides: 50 },
        { city: "Miami", rides: 15 },
      ],
      leader: "Boston",
      lead: 35,
    },
  ]);
});

test("raceFrames ranks cities by cumulative rides, highest first, with ties in alphabetical order", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-01", city: "Denver", rides: 40 },
    { date: "2026-07-01", city: "Boston", rides: 10 },
  ]);
  assert.deepEqual(frames[0].cities, [
    { city: "Denver", rides: 40 },
    { city: "Boston", rides: 10 },
    { city: "Miami", rides: 10 },
  ]);
});

test("raceFrames gives the highest cumulative rides in the last frame as the scale maximum", () => {
  const { max } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-02", city: "Boston", rides: 30 },
    { date: "2026-07-02", city: "Miami", rides: 15 },
  ]);
  assert.equal(max, 50);
});

test("raceFrames returns no frames for no ride rows", () => {
  assert.deepEqual(raceFrames([]), { frames: [], max: 0 });
});

test("raceFrames shows a city at 0 in frames before its first ride row", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-02", city: "Boston", rides: 5 },
    { date: "2026-07-02", city: "Miami", rides: 10 },
  ]);
  assert.deepEqual(frames, [
    {
      date: "2026-07-01",
      cities: [
        { city: "Boston", rides: 20 },
        { city: "Miami", rides: 0 },
      ],
      leader: "Boston",
      lead: 20,
    },
    {
      date: "2026-07-02",
      cities: [
        { city: "Boston", rides: 25 },
        { city: "Miami", rides: 10 },
      ],
      leader: "Boston",
      lead: 15,
    },
  ]);
});

test("raceFrames carries a city's cumulative rides forward when it has no ride row on a date", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-02", city: "Boston", rides: 5 },
    { date: "2026-07-03", city: "Boston", rides: 5 },
    { date: "2026-07-03", city: "Miami", rides: 4 },
  ]);
  assert.deepEqual(
    frames.map((frame) => frame.cities.find(({ city }) => city === "Miami").rides),
    [10, 10, 14],
  );
});

test("raceFrames sums multiple ride rows for the same city and date", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-01", city: "Miami", rides: 6 },
  ]);
  assert.deepEqual(frames, [
    { date: "2026-07-01", cities: [{ city: "Miami", rides: 16 }], leader: "Miami", lead: null },
  ]);
});

test("raceFrames has no frame for a calendar day with no ride rows", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-04", city: "Miami", rides: 6 },
  ]);
  assert.deepEqual(
    frames.map((frame) => frame.date),
    ["2026-07-01", "2026-07-04"],
  );
});

test("raceFrames changes rank order when one city overtakes another", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-01", city: "Miami", rides: 10 },
    { date: "2026-07-02", city: "Boston", rides: 5 },
    { date: "2026-07-02", city: "Miami", rides: 30 },
  ]);
  assert.deepEqual(
    frames.map((frame) => frame.cities.map(({ city }) => city)),
    [
      ["Boston", "Miami"],
      ["Miami", "Boston"],
    ],
  );
});

const leaderAndLead = ({ leader, lead }) => ({ leader, lead });

test("raceFrames gives each frame's leader and its lead over the second-ranked city", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-01", city: "Denver", rides: 5 },
    { date: "2026-07-01", city: "Miami", rides: 12 },
    { date: "2026-07-02", city: "Boston", rides: 1 },
    { date: "2026-07-02", city: "Miami", rides: 30 },
  ]);
  assert.deepEqual(frames.map(leaderAndLead), [
    { leader: "Boston", lead: 8 },
    { leader: "Miami", lead: 21 },
  ]);
});

test("raceFrames gives a tied frame no leader and no lead", () => {
  const { frames } = raceFrames([
    { date: "2026-07-01", city: "Boston", rides: 20 },
    { date: "2026-07-01", city: "Denver", rides: 5 },
    { date: "2026-07-01", city: "Miami", rides: 20 },
  ]);
  assert.deepEqual(frames.map(leaderAndLead), [{ leader: null, lead: null }]);
});

test("raceFrames gives a single city as the leader with no lead", () => {
  const { frames } = raceFrames([{ date: "2026-07-01", city: "Miami", rides: 10 }]);
  assert.deepEqual(frames.map(leaderAndLead), [{ leader: "Miami", lead: null }]);
});
