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
    { date: "2026-07-01", cities: [{ city: "Miami", rides: 10 }] },
    { date: "2026-07-02", cities: [{ city: "Miami", rides: 15 }] },
    { date: "2026-07-03", cities: [{ city: "Miami", rides: 22 }] },
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
    },
    {
      date: "2026-07-02",
      cities: [
        { city: "Boston", rides: 50 },
        { city: "Miami", rides: 15 },
      ],
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
