# Space launch manifest

Northline, a fictional pad. Years, prep lanes, a narrowing queue, a euro fee, and two readiness marks.

## Northline, year by year

Events, and two stretches of work.

```json
{
  "version": "1",
  "id": "northline-years",
  "type": "timeline",
  "theme": "soft",
  "data": [
    {
      "label": "Pad leased",
      "date": "2019-03-04",
      "kind": "event"
    },
    {
      "label": "First static fire",
      "date": "2020-11-12",
      "kind": "event"
    },
    {
      "label": "Sounding flights",
      "start": "2021-04-01",
      "end": "2023-09-01",
      "kind": "period"
    },
    {
      "label": "Cinder crew",
      "date": "2024-01-18",
      "kind": "event"
    },
    {
      "label": "Stack rehearsals",
      "start": "2024-06-01",
      "end": "2026-02-01",
      "kind": "period"
    },
    {
      "label": "Window booked",
      "date": "2026-05-20",
      "kind": "event"
    }
  ],
  "encoding": {
    "x": "label",
    "open": "start",
    "close": "end",
    "color": "kind"
  },
  "size": {
    "width": 980,
    "height": 360
  },
  "a11y": {
    "alt": "Northline leased a pad in 2019, flew sounding missions through 2023, and booked a window for May 2026."
  }
}
```

## Prep lanes for Cinder

Sections, a finished lane, and a liftoff milestone.

```json
{
  "version": "1",
  "id": "cinder-lanes",
  "type": "gantt",
  "theme": "soft",
  "data": [
    {
      "id": "tank",
      "task": "Proof the tank",
      "section": "Prep",
      "start": "2026-04-06",
      "end": "2026-04-17",
      "progress": 1,
      "status": "done"
    },
    {
      "id": "avionics",
      "task": "Fit avionics",
      "section": "Prep",
      "start": "2026-04-13",
      "end": "2026-04-28",
      "progress": 0.7,
      "status": "active",
      "depends": "tank"
    },
    {
      "id": "stack",
      "task": "Stack the stages",
      "section": "Stack",
      "start": "2026-04-22",
      "end": "2026-05-08",
      "progress": 0.4,
      "status": "active",
      "depends": "tank"
    },
    {
      "id": "dress",
      "task": "Dress rehearsal",
      "section": "Stack",
      "start": "2026-05-06",
      "end": "2026-05-15",
      "progress": 0.15,
      "status": "crit",
      "depends": "stack"
    },
    {
      "id": "lift",
      "task": "Liftoff",
      "section": "Fire",
      "start": "2026-05-20",
      "milestone": true,
      "status": "crit",
      "depends": "dress"
    }
  ],
  "encoding": {
    "x": "task",
    "y": "section",
    "open": "start",
    "close": "end",
    "color": "status",
    "source": "id",
    "target": "depends"
  },
  "size": {
    "width": 980,
    "height": 420
  },
  "a11y": {
    "alt": "The tank is proved. Dress rehearsal is the critical lane, and liftoff is marked for 20 May."
  }
}
```

## From pitch to liftoff

How many proposals are still in the queue.

```json
{
  "version": "1",
  "id": "northline-funnel",
  "type": "funnel",
  "theme": "soft",
  "data": [
    {
      "stage": "Pitch",
      "count": 48
    },
    {
      "stage": "Shortlist",
      "count": 22
    },
    {
      "stage": "Pad slot",
      "count": 9
    },
    {
      "stage": "Stacked",
      "count": 4
    },
    {
      "stage": "Away",
      "count": 1
    }
  ],
  "encoding": {
    "x": "stage",
    "y": "count"
  },
  "legend": {
    "position": "top"
  },
  "size": {
    "width": 720,
    "height": 380
  },
  "a11y": {
    "alt": "Forty-eight pitches narrow to one vehicle that leaves the pad."
  }
}
```

## Pad fee

The booked window, in euros.

```json
{
  "version": "1",
  "id": "northline-fee",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-IE",
  "metric": {
    "label": "Pad fee",
    "value": 186000,
    "delta": 0.04,
    "format": {
      "style": "currency",
      "currency": "EUR",
      "decimals": 0
    }
  },
  "data": [
    140,
    152,
    161,
    174,
    186
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "The pad fee is 186,000 euros, up 4 percent on the last window."
  }
}
```

## Readiness

The needle and the figure both read 72. The dot on the arc is the target at 80.

```json
{
  "version": "1",
  "id": "cinder-readiness",
  "type": "gauge",
  "theme": "soft",
  "metric": {
    "label": "Readiness",
    "value": 72,
    "min": 0,
    "max": 100,
    "target": 80,
    "format": {
      "style": "number",
      "decimals": 0
    },
    "bands": [
      {
        "from": 0,
        "to": 50,
        "color": "negative",
        "label": "Hold"
      },
      {
        "from": 50,
        "to": 100,
        "color": "positive",
        "label": "Go"
      }
    ]
  },
  "size": {
    "width": 420,
    "height": 250
  },
  "a11y": {
    "alt": "The needle reads 72. A dot on the arc marks the target at 80."
  }
}
```

## Checks closed

Seven of ten cards on the wall.

```json
{
  "version": "1",
  "id": "cinder-checks",
  "type": "progress-ring",
  "theme": "soft",
  "metric": {
    "label": "Checks",
    "value": 7,
    "min": 0,
    "max": 10,
    "format": {
      "style": "number",
      "decimals": 0
    }
  },
  "size": {
    "width": 240,
    "height": 240
  },
  "a11y": {
    "alt": "Seven of ten pre-flight checks are closed."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Funnel](https://chartkit.dev/features/type.funnel) (`type.funnel`)
- [Gantt](https://chartkit.dev/features/type.gantt) (`type.gantt`)
- [Gauge / dial](https://chartkit.dev/features/type.gauge) (`type.gauge`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)
- [Progress ring](https://chartkit.dev/features/type.progress.ring) (`type.progress.ring`)
- [Timeline / event chart](https://chartkit.dev/features/type.timeline) (`type.timeline`)

https://chartkit.dev/showcase/launch
