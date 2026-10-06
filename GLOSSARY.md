# Rides dashboard

Daily ride counts per city, and the summaries and charts built from them.

## Language

**Ride row**:
One record of how many rides a single city had on a single date.
_Avoid_: Entry, record, data point

**Cumulative rides**:
A city's rides summed over every date up to and including a given date, counted from the first date in the data.
_Avoid_: Running total, total to date

**Frame**:
The state of the race on one date: every city's cumulative rides on that date, ranked. There is one frame per date present in the data.
_Avoid_: Step, tick, snapshot

**Rank**:
A city's position within a frame, ordered by cumulative rides from highest to lowest, with ties broken alphabetically by city.
_Avoid_: Position, place

**Leader**:
The city with the highest cumulative rides in a frame. When two or more cities share the highest value, the frame is tied and has no leader.
_Avoid_: Winner, first place

**Lead**:
How many cumulative rides the leader is ahead of the second-ranked city in a frame.
_Avoid_: Margin, gap

**Race chart**:
An animated bar chart that plays through the frames in date order, one bar per city.
_Avoid_: Bar race, animation
