// Automatisch erzeugt mit `npm run library` aus src/library/curation – nicht von Hand ändern.
import type { LibraryIndexEntry } from './types.ts'

export const LIBRARY_INDEX: LibraryIndexEntry[] = [
  {
    "id": "bankdruecken-langhantel",
    "name": "Bankdrücken (Langhantel)",
    "en": "Barbell Bench Press",
    "aliases": [
      "Bankdrücken",
      "Bench Press"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "bench-press"
    }
  },
  {
    "id": "bankdruecken-kurzhantel",
    "name": "Bankdrücken (Kurzhantel)",
    "en": "Dumbbell Bench Press",
    "aliases": [
      "Kurzhantel-Bankdrücken"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-bench-press"
    }
  },
  {
    "id": "schraegbank-kurzhantel",
    "name": "Schrägbankdrücken (Kurzhantel)",
    "en": "Incline Dumbbell Press",
    "aliases": [
      "Schrägbank Kurzhantel",
      "Bankdrücken schräg"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne",
        "trizeps"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "incline-dumbbell-press"
    }
  },
  {
    "id": "brustpresse-maschine",
    "name": "Brustpresse (Maschine)",
    "en": "Machine Chest Press",
    "aliases": [
      "Brustpresse",
      "Chest Press"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "machine-chest-press"
    }
  },
  {
    "id": "butterfly-maschine",
    "name": "Butterfly (Maschine)",
    "en": "Pec Deck",
    "aliases": [
      "Butterfly Maschine",
      "Pec Deck",
      "Flys"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "fliegende",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "pec-deck"
    }
  },
  {
    "id": "kabel-fliegende",
    "name": "Fliegende am Kabel",
    "en": "Cable Fly",
    "aliases": [
      "Cable Crossover",
      "Kabelzug-Fliegende"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "fliegende",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-fly"
    }
  },
  {
    "id": "liegestuetz",
    "name": "Liegestütz",
    "en": "Push-up",
    "aliases": [
      "Liegestütze",
      "Push-ups"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne",
        "bauch"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "push-up"
    }
  },
  {
    "id": "dips",
    "name": "Dips (Barren)",
    "en": "Dip",
    "aliases": [
      "Barrenstütz",
      "Dips"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "trizeps",
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 90,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "dip"
    }
  },
  {
    "id": "schraegbank-langhantel",
    "name": "Schrägbankdrücken (Langhantel)",
    "en": "Incline Bench Press",
    "aliases": [
      "Schrägbank Langhantel",
      "Incline Bench"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne",
        "trizeps"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "incline-bench-press"
    }
  },
  {
    "id": "negativbankdruecken",
    "name": "Negativbankdrücken (Langhantel)",
    "en": "Decline Bench Press",
    "aliases": [
      "Decline Bench",
      "Negativ-Bankdrücken"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "decline-bench-press"
    }
  },
  {
    "id": "fliegende-kurzhantel",
    "name": "Fliegende (Kurzhantel)",
    "en": "Dumbbell Fly",
    "aliases": [
      "Kurzhantel-Flys",
      "Flys"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "fliegende",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-fly"
    }
  },
  {
    "id": "kabel-fliegende-unten",
    "name": "Fliegende am Kabel von unten",
    "en": "Low-to-High Cable Fly",
    "aliases": [
      "Kabelzug von unten",
      "Cable Fly low"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "fliegende",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "incline-cable-fly"
    }
  },
  {
    "id": "bankdruecken-multipresse",
    "name": "Bankdrücken an der Multipresse",
    "en": "Smith Machine Bench Press",
    "aliases": [
      "Smith-Maschine Bankdrücken",
      "Multipresse Bank"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "smith-machine-bench-press"
    }
  },
  {
    "id": "liegestuetz-erhoeht",
    "name": "Liegestütz erhöht (Hände auf Bank)",
    "en": "Incline Push-up",
    "aliases": [
      "Schräge Liegestütze",
      "Incline Push-up"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "trizeps",
        "schulter-vorne",
        "bauch"
      ]
    },
    "loads": [
      "schulter",
      "handgelenk"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "incline-push-up"
    }
  },
  {
    "id": "liegestuetz-eng",
    "name": "Liegestütz eng (Diamant)",
    "en": "Diamond Push-up",
    "aliases": [
      "Diamant-Liegestütz",
      "Enge Liegestütze"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "trizeps",
        "brust"
      ],
      "secondary": [
        "schulter-vorne",
        "bauch"
      ]
    },
    "loads": [
      "ellbogen",
      "handgelenk",
      "schulter"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "diamond-push-up"
    }
  },
  {
    "id": "latzug-breit",
    "name": "Latzug breit",
    "en": "Lat Pulldown",
    "aliases": [
      "Latziehen",
      "Latzug am Kabel",
      "Lat-Zug"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken",
        "schulter-hinten"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "lat-pulldown"
    }
  },
  {
    "id": "latzug-eng",
    "name": "Latzug eng",
    "en": "Close-Grip Lat Pulldown",
    "aliases": [
      "Latzug enger Griff",
      "Latzug V-Griff"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "close-grip-lat-pulldown"
    }
  },
  {
    "id": "klimmzug",
    "name": "Klimmzug",
    "en": "Pull-up",
    "aliases": [
      "Klimmzüge"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 120,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "pull-up"
    }
  },
  {
    "id": "klimmzug-unterstuetzt",
    "name": "Klimmzug mit Unterstützung (Maschine)",
    "en": "Assisted Pull-up",
    "aliases": [
      "Klimmzugmaschine",
      "Assisted Pull-up"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "assisted": true,
    "media": {
      "source": "workout-guide",
      "ref": "assisted-pull-up"
    }
  },
  {
    "id": "rudern-kabel-sitzend",
    "name": "Rudern am Kabel, sitzend",
    "en": "Seated Cable Row",
    "aliases": [
      "Kabelrudern",
      "Ruderzug am Kabel",
      "Rudern"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "seated-row"
    }
  },
  {
    "id": "rudern-maschine",
    "name": "Rudermaschine (Brustpolster)",
    "en": "Machine Row",
    "aliases": [
      "Rudern Maschine",
      "Ruderzug Maschine"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten"
      ]
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "machine-row"
    }
  },
  {
    "id": "rudern-kurzhantel-einarmig",
    "name": "Rudern einarmig (Kurzhantel)",
    "en": "One-Arm Dumbbell Row",
    "aliases": [
      "Kurzhantelrudern"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "lat",
        "oberer-ruecken"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "one-arm-dumbbell-row"
    }
  },
  {
    "id": "inverted-row",
    "name": "Rudern am Körpergewicht (Inverted Row)",
    "en": "Inverted Row",
    "aliases": [
      "Australian Pull-up",
      "Tischrudern"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten",
        "bauch"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "inverted-row"
    }
  },
  {
    "id": "ueberzug-kurzhantel",
    "name": "Überzug (Kurzhantel)",
    "en": "Dumbbell Pullover",
    "aliases": [
      "Überzüge",
      "Pullover"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ueberzug",
    "muscles": {
      "primary": [
        "lat",
        "brust"
      ],
      "secondary": [
        "trizeps",
        "serratus"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "restSec": 60,
    "media": {
      "source": "everkinetic",
      "ref": "dumbbell-bent-arm-pullover"
    }
  },
  {
    "id": "rueckenstrecker",
    "name": "Rückenstrecker (Hyperextension)",
    "en": "Back Extension",
    "aliases": [
      "Hyperextension",
      "Rückenstrecken"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rueckenstrecken",
    "muscles": {
      "primary": [
        "unterer-ruecken"
      ],
      "secondary": [
        "gesaess",
        "beinbeuger"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "back-extension"
    }
  },
  {
    "id": "kreuzheben-langhantel",
    "name": "Kreuzheben (Langhantel)",
    "en": "Deadlift",
    "aliases": [
      "Kreuzheben",
      "Deadlift"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess",
        "beinbeuger",
        "unterer-ruecken"
      ],
      "secondary": [
        "quadrizeps",
        "oberer-ruecken",
        "unterarme",
        "oberer-trapez"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte",
      "knie"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "deadlift"
    }
  },
  {
    "id": "langhantelrudern",
    "name": "Langhantelrudern vorgebeugt",
    "en": "Barbell Row",
    "aliases": [
      "Rudern vorgebeugt",
      "Bent-over Row"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten",
        "unterer-ruecken"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "barbell-row"
    }
  },
  {
    "id": "t-bar-rudern",
    "name": "T-Bar-Rudern",
    "en": "T-Bar Row",
    "aliases": [
      "T-Stangen-Rudern",
      "Landmine Row"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "t-bar-row"
    }
  },
  {
    "id": "rudern-kurzhantel-beidarmig",
    "name": "Rudern vorgebeugt (Kurzhantel)",
    "en": "Dumbbell Bent-over Row",
    "aliases": [
      "Kurzhantelrudern beidarmig"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "oberer-ruecken",
        "lat"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-bent-over-row"
    }
  },
  {
    "id": "rudern-kabel-einarmig",
    "name": "Rudern am Kabel, einarmig",
    "en": "Single-Arm Cable Row",
    "aliases": [
      "Einarmiges Kabelrudern"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "ziehen-horizontal",
    "muscles": {
      "primary": [
        "lat",
        "oberer-ruecken"
      ],
      "secondary": [
        "bizeps",
        "schulter-hinten",
        "seitliche-bauchmuskeln"
      ]
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "single-arm-cable-row"
    }
  },
  {
    "id": "latzug-gestreckte-arme",
    "name": "Latzug mit gestreckten Armen",
    "en": "Straight-Arm Pulldown",
    "aliases": [
      "Pullover am Kabel",
      "Straight-Arm Pulldown"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "ueberzug",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "schulter-hinten",
        "trizeps",
        "bauch"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "straight-arm-pulldown"
    }
  },
  {
    "id": "klimmzug-untergriff",
    "name": "Klimmzug Untergriff (Chin-up)",
    "en": "Chin-up",
    "aliases": [
      "Chin-up",
      "Klimmzug eng Untergriff"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat",
        "bizeps"
      ],
      "secondary": [
        "oberer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 120,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "chin-up"
    }
  },
  {
    "id": "klimmzug-neutral",
    "name": "Klimmzug neutraler Griff",
    "en": "Neutral-Grip Pull-up",
    "aliases": [
      "Hammergriff-Klimmzug",
      "Parallelgriff-Klimmzug"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 120,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "neutral-grip-pull-up"
    }
  },
  {
    "id": "klimmzug-negativ",
    "name": "Negativ-Klimmzug",
    "en": "Negative Pull-up",
    "aliases": [
      "Exzentrischer Klimmzug",
      "Negativer Klimmzug"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "lat"
      ],
      "secondary": [
        "bizeps",
        "oberer-ruecken"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 90,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "negative-pull-up"
    }
  },
  {
    "id": "schulterheben-kurzhantel",
    "name": "Schulterheben (Kurzhantel)",
    "en": "Dumbbell Shrug",
    "aliases": [
      "Shrugs",
      "Nackenheben"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ziehen-vertikal",
    "muscles": {
      "primary": [
        "oberer-trapez"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "nacken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-shrug"
    }
  },
  {
    "id": "face-pull-band",
    "name": "Face Pull mit Band",
    "en": "Banded Face Pull",
    "aliases": [
      "Band Face Pull"
    ],
    "equipment": "band",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten",
        "oberer-ruecken"
      ],
      "secondary": [
        "rotatorenmanschette"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "banded-face-pull"
    }
  },
  {
    "id": "superman",
    "name": "Superman",
    "en": "Superman",
    "aliases": [
      "Rückenheben liegend"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rueckenstrecken",
    "muscles": {
      "primary": [
        "unterer-ruecken"
      ],
      "secondary": [
        "gesaess",
        "oberer-ruecken"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "superman"
    }
  },
  {
    "id": "schulterpresse-maschine",
    "name": "Schulterpresse (Maschine)",
    "en": "Machine Shoulder Press",
    "aliases": [
      "Schulterdrücken Maschine",
      "Shoulder Press"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "schulter-seitlich",
        "trizeps"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "machine-shoulder-press"
    }
  },
  {
    "id": "schulterdruecken-kurzhantel",
    "name": "Schulterdrücken sitzend (Kurzhantel)",
    "en": "Seated Dumbbell Shoulder Press",
    "aliases": [
      "Kurzhantel-Schulterdrücken"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "schulter-seitlich",
        "trizeps"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "seated-dumbbell-press"
    }
  },
  {
    "id": "seitheben-kurzhantel",
    "name": "Seitheben (Kurzhantel)",
    "en": "Lateral Raise",
    "aliases": [
      "Seitheben Kurzhantel",
      "Seitheben"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "seitheben",
    "muscles": {
      "primary": [
        "schulter-seitlich"
      ],
      "secondary": [
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "lateral-raise"
    }
  },
  {
    "id": "seitheben-kabel",
    "name": "Seitheben am Kabel",
    "en": "Cable Lateral Raise",
    "aliases": [
      "Kabel-Seitheben"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "seitheben",
    "muscles": {
      "primary": [
        "schulter-seitlich"
      ],
      "secondary": [
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-lateral-raise"
    }
  },
  {
    "id": "frontheben-kurzhantel",
    "name": "Frontheben (Kurzhantel)",
    "en": "Front Raise",
    "aliases": [
      "Frontraise"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "frontheben",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "schulter-seitlich",
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "front-raise"
    }
  },
  {
    "id": "reverse-butterfly-maschine",
    "name": "Reverse Butterfly (Maschine)",
    "en": "Reverse Pec Deck",
    "aliases": [
      "Butterfly reverse",
      "Reverse Flys"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten"
      ],
      "secondary": [
        "oberer-ruecken"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "reverse-pec-deck"
    }
  },
  {
    "id": "reverse-fliegende-kurzhantel",
    "name": "Reverse Fliegende vorgebeugt (Kurzhantel)",
    "en": "Bent-Over Rear Delt Fly",
    "aliases": [
      "Rear Delt Fly",
      "Seitheben vorgebeugt"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten"
      ],
      "secondary": [
        "oberer-ruecken"
      ]
    },
    "loads": [
      "schulter",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "rear-delt-fly"
    }
  },
  {
    "id": "face-pull",
    "name": "Face Pull",
    "en": "Face Pull",
    "aliases": [
      "Facepulls",
      "Face Pulls"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten",
        "oberer-ruecken"
      ],
      "secondary": [
        "rotatorenmanschette",
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "face-pull"
    }
  },
  {
    "id": "schulterdruecken-langhantel",
    "name": "Schulterdrücken stehend (Langhantel)",
    "en": "Overhead Press",
    "aliases": [
      "Military Press",
      "Überkopfdrücken"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "schulter-seitlich",
        "trizeps",
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen",
      "unterer-ruecken"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "overhead-press"
    }
  },
  {
    "id": "arnold-press",
    "name": "Arnold Press (Kurzhantel)",
    "en": "Arnold Press",
    "aliases": [
      "Arnold-Drücken"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "schulter-vorne",
        "schulter-seitlich"
      ],
      "secondary": [
        "trizeps"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "arnold-press"
    }
  },
  {
    "id": "aufrechtes-rudern",
    "name": "Aufrechtes Rudern (Langhantel)",
    "en": "Upright Row",
    "aliases": [
      "Upright Row",
      "Kinnziehen"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "seitheben",
    "muscles": {
      "primary": [
        "schulter-seitlich"
      ],
      "secondary": [
        "oberer-trapez",
        "bizeps"
      ]
    },
    "loads": [
      "schulter",
      "handgelenk"
    ],
    "level": "fortgeschritten",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "upright-row"
    }
  },
  {
    "id": "seitheben-maschine",
    "name": "Seitheben (Maschine)",
    "en": "Machine Lateral Raise",
    "aliases": [
      "Seitheben Gerät"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "seitheben",
    "muscles": {
      "primary": [
        "schulter-seitlich"
      ],
      "secondary": [
        "oberer-trapez"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "machine-lateral-raise"
    }
  },
  {
    "id": "frontheben-kabel",
    "name": "Frontheben am Kabel",
    "en": "Cable Front Raise",
    "aliases": [
      "Frontheben Seilzug"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "frontheben",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "schulter-seitlich",
        "serratus"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-front-raise"
    }
  },
  {
    "id": "reverse-fliegende-kabel",
    "name": "Reverse Fliegende am Kabel",
    "en": "Cable Rear Delt Fly",
    "aliases": [
      "Reverse Flys Kabel",
      "Kabel Reverse Butterfly"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten"
      ],
      "secondary": [
        "oberer-ruecken",
        "rotatorenmanschette"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-rear-delt-fly"
    }
  },
  {
    "id": "pike-liegestuetz",
    "name": "Pike-Liegestütz",
    "en": "Pike Push-up",
    "aliases": [
      "Pike Push-up",
      "Schulter-Liegestütz"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "schulter-vorne"
      ],
      "secondary": [
        "trizeps",
        "schulter-seitlich",
        "serratus"
      ]
    },
    "loads": [
      "schulter",
      "handgelenk",
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 90,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "pike-push-up"
    }
  },
  {
    "id": "band-pull-apart",
    "name": "Band Pull-Apart",
    "en": "Band Pull-Apart",
    "aliases": [
      "Pull-Apart",
      "Band auseinanderziehen"
    ],
    "equipment": "band",
    "category": "kraft",
    "pattern": "reverse-fliegende",
    "muscles": {
      "primary": [
        "schulter-hinten",
        "oberer-ruecken"
      ],
      "secondary": [
        "rotatorenmanschette"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "band-pull-apart"
    }
  },
  {
    "id": "bizepscurl-kurzhantel",
    "name": "Bizepscurl (Kurzhantel)",
    "en": "Dumbbell Biceps Curl",
    "aliases": [
      "Bizepscurl",
      "Curls"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "bicep-curl"
    }
  },
  {
    "id": "hammercurl",
    "name": "Hammercurl (Kurzhantel)",
    "en": "Hammer Curl",
    "aliases": [
      "Hammer Curls"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps",
        "unterarme"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "hammer-curl"
    }
  },
  {
    "id": "sz-curl",
    "name": "Bizepscurl (SZ-Stange)",
    "en": "EZ-Bar Curl",
    "aliases": [
      "SZ-Curl"
    ],
    "equipment": "sz-stange",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "ez-bar-curl"
    }
  },
  {
    "id": "trizepsdruecken-kabel",
    "name": "Trizepsdrücken am Kabel",
    "en": "Triceps Pushdown",
    "aliases": [
      "Pushdown",
      "Trizeps Kabel"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "trizeps-streckung",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "tricep-pushdown"
    }
  },
  {
    "id": "trizeps-ueber-kopf-kabel",
    "name": "Trizepsstrecken über Kopf (Kabel)",
    "en": "Overhead Cable Triceps Extension",
    "aliases": [
      "Trizeps über Kopf"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "trizeps-streckung",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen",
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "overhead-tricep-extension"
    }
  },
  {
    "id": "kabel-curl",
    "name": "Bizepscurl am Kabel",
    "en": "Cable Curl",
    "aliases": [
      "Kabel-Curl",
      "Curl am Seilzug"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-curl"
    }
  },
  {
    "id": "scott-curl",
    "name": "Scott-Curl (Maschine)",
    "en": "Preacher Curl",
    "aliases": [
      "Preacher Curl",
      "Bizepsmaschine"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "preacher-curl"
    }
  },
  {
    "id": "konzentrations-curl",
    "name": "Konzentrations-Curl (Kurzhantel)",
    "en": "Concentration Curl",
    "aliases": [
      "Konzentrationscurl"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "concentration-curl"
    }
  },
  {
    "id": "schraegbank-curl",
    "name": "Schrägbank-Curl (Kurzhantel)",
    "en": "Incline Dumbbell Curl",
    "aliases": [
      "Incline Curl"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "ellbogen",
      "schulter"
    ],
    "level": "fortgeschritten",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "incline-dumbbell-curl"
    }
  },
  {
    "id": "hammercurl-seil",
    "name": "Hammercurl am Seil",
    "en": "Rope Hammer Curl",
    "aliases": [
      "Seil-Hammercurl"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "curl",
    "muscles": {
      "primary": [
        "bizeps",
        "unterarme"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen",
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "rope-hammer-curl"
    }
  },
  {
    "id": "trizepsdruecken-seil",
    "name": "Trizepsdrücken am Seil",
    "en": "Rope Triceps Pushdown",
    "aliases": [
      "Seil-Pushdown",
      "Trizeps am Seil"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "trizeps-streckung",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "rope-tricep-pushdown"
    }
  },
  {
    "id": "stirndruecken-langhantel",
    "name": "Stirndrücken (Langhantel/SZ)",
    "en": "Skull Crusher",
    "aliases": [
      "French Press",
      "Skull Crusher"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "trizeps-streckung",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen"
    ],
    "level": "fortgeschritten",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "skull-crusher"
    }
  },
  {
    "id": "trizeps-kickback",
    "name": "Trizeps-Kickback (Kurzhantel)",
    "en": "Triceps Kickback",
    "aliases": [
      "Kickbacks"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "trizeps-streckung",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": []
    },
    "loads": [
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "tricep-kickback"
    }
  },
  {
    "id": "bankdruecken-eng",
    "name": "Bankdrücken eng (Langhantel)",
    "en": "Close-Grip Bench Press",
    "aliases": [
      "Enges Bankdrücken"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "druecken-horizontal",
    "muscles": {
      "primary": [
        "trizeps"
      ],
      "secondary": [
        "brust",
        "schulter-vorne"
      ]
    },
    "loads": [
      "ellbogen",
      "handgelenk",
      "schulter"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "close-grip-bench-press"
    }
  },
  {
    "id": "dips-maschine-unterstuetzt",
    "name": "Dips mit Unterstützung (Maschine)",
    "en": "Assisted Dip",
    "aliases": [
      "Dipmaschine",
      "Dips assistiert"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "druecken-vertikal",
    "muscles": {
      "primary": [
        "trizeps",
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter",
      "ellbogen"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "assisted": true,
    "media": {
      "source": "workout-guide",
      "ref": "assisted-dip"
    }
  },
  {
    "id": "beinpresse",
    "name": "Beinpresse",
    "en": "Leg Press",
    "aliases": [
      "Beinpresse Maschine"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": [
        "gesaess",
        "beinbeuger"
      ]
    },
    "loads": [
      "knie",
      "huefte",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "leg-press"
    }
  },
  {
    "id": "kniebeuge-langhantel",
    "name": "Kniebeuge (Langhantel)",
    "en": "Barbell Back Squat",
    "aliases": [
      "Kniebeuge",
      "Squat",
      "Kniebeugen"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren",
        "beinbeuger",
        "unterer-ruecken"
      ]
    },
    "loads": [
      "knie",
      "huefte",
      "unterer-ruecken"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "squat"
    }
  },
  {
    "id": "hackenschmidt-kniebeuge",
    "name": "Hackenschmidt-Kniebeuge (Maschine)",
    "en": "Hack Squat",
    "aliases": [
      "Hack Squat",
      "Hackenschmidt"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": [
        "gesaess",
        "adduktoren"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "hack-squat"
    }
  },
  {
    "id": "goblet-squat",
    "name": "Goblet Squat",
    "en": "Goblet Squat",
    "aliases": [
      "Goblet-Kniebeuge"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren",
        "bauch"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "goblet-squat"
    }
  },
  {
    "id": "bulgarische-kniebeuge",
    "name": "Bulgarische Kniebeuge (Kurzhantel)",
    "en": "Bulgarian Split Squat",
    "aliases": [
      "Split Squat",
      "Bulgarian Split Squat"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren",
        "beinbeuger"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "fortgeschritten",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "bulgarian-split-squat"
    }
  },
  {
    "id": "ausfallschritte-kurzhantel",
    "name": "Ausfallschritte gehend (Kurzhantel)",
    "en": "Walking Lunge",
    "aliases": [
      "Ausfallschritte",
      "Lunges"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "beinbeuger",
        "adduktoren"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "walking-lunge"
    }
  },
  {
    "id": "aufsteiger-kurzhantel",
    "name": "Aufsteiger (Kurzhantel)",
    "en": "Dumbbell Step-up",
    "aliases": [
      "Step-up",
      "Step-ups"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "beinbeuger"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "step-up"
    }
  },
  {
    "id": "rumaenisches-kreuzheben",
    "name": "Rumänisches Kreuzheben",
    "en": "Romanian Deadlift",
    "aliases": [
      "RDL",
      "Rumänisches Kreuzheben Langhantel"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "beinbeuger",
        "gesaess"
      ],
      "secondary": [
        "unterer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte"
    ],
    "level": "fortgeschritten",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "romanian-deadlift"
    }
  },
  {
    "id": "hip-thrust",
    "name": "Hip Thrust",
    "en": "Barbell Hip Thrust",
    "aliases": [
      "Hüftstoßen"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess"
      ],
      "secondary": [
        "beinbeuger",
        "quadrizeps"
      ]
    },
    "loads": [
      "huefte",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "hip-thrust"
    }
  },
  {
    "id": "glute-bridge",
    "name": "Beckenheben (Glute Bridge)",
    "en": "Glute Bridge",
    "aliases": [
      "Beckenheben",
      "Hüftheben"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess"
      ],
      "secondary": [
        "beinbeuger"
      ]
    },
    "loads": [
      "huefte",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "glute-bridge"
    }
  },
  {
    "id": "beinstrecker",
    "name": "Beinstrecker (Maschine)",
    "en": "Leg Extension",
    "aliases": [
      "Beinstrecken"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "beinstrecken",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": []
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "leg-extension"
    }
  },
  {
    "id": "beinbeuger-liegend",
    "name": "Beinbeuger liegend (Maschine)",
    "en": "Lying Leg Curl",
    "aliases": [
      "Beinbeuger liegend"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "beinbeugen",
    "muscles": {
      "primary": [
        "beinbeuger"
      ],
      "secondary": [
        "waden"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "lying-leg-curl"
    }
  },
  {
    "id": "beinbeuger-sitzend",
    "name": "Beinbeuger sitzend (Maschine)",
    "en": "Seated Leg Curl",
    "aliases": [
      "Beinbeuger sitzend"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "beinbeugen",
    "muscles": {
      "primary": [
        "beinbeuger"
      ],
      "secondary": [
        "waden"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "seated-leg-curl"
    }
  },
  {
    "id": "wadenheben-stehend",
    "name": "Wadenheben stehend (Maschine)",
    "en": "Standing Calf Raise",
    "aliases": [
      "Wadenheben"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "wadenheben",
    "muscles": {
      "primary": [
        "waden"
      ],
      "secondary": []
    },
    "loads": [
      "sprunggelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "standing-calf-raise"
    }
  },
  {
    "id": "wadenheben-sitzend",
    "name": "Wadenheben sitzend (Maschine)",
    "en": "Seated Calf Raise",
    "aliases": [],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "wadenheben",
    "muscles": {
      "primary": [
        "waden"
      ],
      "secondary": []
    },
    "loads": [
      "sprunggelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "seated-calf-raise"
    }
  },
  {
    "id": "adduktoren-maschine",
    "name": "Adduktoren-Maschine",
    "en": "Hip Adduction Machine",
    "aliases": [
      "Beinadduktion",
      "Adduktoren"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "adduktion",
    "muscles": {
      "primary": [
        "adduktoren"
      ],
      "secondary": []
    },
    "loads": [
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "hip-adduction-machine"
    }
  },
  {
    "id": "abduktoren-maschine",
    "name": "Abduktoren-Maschine",
    "en": "Hip Abduction Machine",
    "aliases": [
      "Beinabduktion",
      "Abduktoren"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "abduktion",
    "muscles": {
      "primary": [
        "abduktoren",
        "gesaess"
      ],
      "secondary": []
    },
    "loads": [
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "hip-abduction-machine"
    }
  },
  {
    "id": "frontkniebeuge",
    "name": "Frontkniebeuge (Langhantel)",
    "en": "Front Squat",
    "aliases": [
      "Front Squat"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": [
        "gesaess",
        "bauch",
        "adduktoren"
      ]
    },
    "loads": [
      "knie",
      "handgelenk",
      "unterer-ruecken"
    ],
    "level": "fortgeschritten",
    "restSec": 150,
    "media": {
      "source": "workout-guide",
      "ref": "front-squat"
    }
  },
  {
    "id": "sumo-kreuzheben",
    "name": "Sumo-Kreuzheben (Langhantel)",
    "en": "Sumo Deadlift",
    "aliases": [
      "Sumo Deadlift"
    ],
    "equipment": "langhantel",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess",
        "adduktoren"
      ],
      "secondary": [
        "beinbeuger",
        "quadrizeps",
        "unterer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte",
      "knie"
    ],
    "level": "fortgeschritten",
    "restSec": 150,
    "media": {
      "source": "workout-guide",
      "ref": "sumo-deadlift"
    }
  },
  {
    "id": "rumaenisches-kreuzheben-kurzhantel",
    "name": "Rumänisches Kreuzheben (Kurzhantel)",
    "en": "Dumbbell Romanian Deadlift",
    "aliases": [
      "RDL Kurzhantel"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "beinbeuger",
        "gesaess"
      ],
      "secondary": [
        "unterer-ruecken",
        "unterarme"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-romanian-deadlift"
    }
  },
  {
    "id": "ausfallschritt-rueckwaerts",
    "name": "Ausfallschritt rückwärts (Kurzhantel)",
    "en": "Reverse Lunge",
    "aliases": [
      "Reverse Lunge",
      "Rückwärts-Ausfallschritt"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "beinbeuger",
        "adduktoren"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "reverse-lunge"
    }
  },
  {
    "id": "split-squat",
    "name": "Split Squat (Kurzhantel)",
    "en": "Split Squat",
    "aliases": [
      "Statischer Ausfallschritt"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren",
        "beinbeuger"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "split-squat"
    }
  },
  {
    "id": "ausfallschritt-seitlich",
    "name": "Seitlicher Ausfallschritt (Kurzhantel)",
    "en": "Lateral Lunge",
    "aliases": [
      "Seitausfallschritt",
      "Side Lunge"
    ],
    "equipment": "kurzhantel",
    "category": "kraft",
    "pattern": "ausfallschritt",
    "muscles": {
      "primary": [
        "quadrizeps",
        "adduktoren"
      ],
      "secondary": [
        "gesaess"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "dumbbell-lateral-lunge"
    }
  },
  {
    "id": "kniebeuge-multipresse",
    "name": "Kniebeuge an der Multipresse",
    "en": "Smith Machine Squat",
    "aliases": [
      "Smith-Maschine Kniebeuge"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren",
        "beinbeuger"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 120,
    "media": {
      "source": "workout-guide",
      "ref": "smith-machine-squat"
    }
  },
  {
    "id": "wadenheben-beinpresse",
    "name": "Wadenheben an der Beinpresse",
    "en": "Leg Press Calf Raise",
    "aliases": [
      "Wadendrücken Beinpresse"
    ],
    "equipment": "maschine",
    "category": "kraft",
    "pattern": "wadenheben",
    "muscles": {
      "primary": [
        "waden"
      ],
      "secondary": []
    },
    "loads": [
      "sprunggelenk"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "leg-press-calf-raise"
    }
  },
  {
    "id": "wadenheben-einbeinig",
    "name": "Wadenheben einbeinig",
    "en": "Single-Leg Calf Raise",
    "aliases": [
      "Einbeiniges Wadenheben"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "wadenheben",
    "muscles": {
      "primary": [
        "waden"
      ],
      "secondary": []
    },
    "loads": [
      "sprunggelenk"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "single-leg-calf-raise"
    }
  },
  {
    "id": "nordic-curl",
    "name": "Nordic Curl",
    "en": "Nordic Hamstring Curl",
    "aliases": [
      "Nordic Hamstring Curl"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "beinbeugen",
    "muscles": {
      "primary": [
        "beinbeuger"
      ],
      "secondary": [
        "gesaess",
        "waden"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 120,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "nordic-hamstring-curl"
    }
  },
  {
    "id": "kickback-kabel",
    "name": "Kickback am Kabel",
    "en": "Cable Glute Kickback",
    "aliases": [
      "Glute Kickback",
      "Beinstrecken nach hinten"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess"
      ],
      "secondary": [
        "beinbeuger"
      ]
    },
    "loads": [
      "huefte",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-kickback"
    }
  },
  {
    "id": "abduktion-kabel",
    "name": "Abduktion am Kabel, stehend",
    "en": "Cable Hip Abduction",
    "aliases": [
      "Bein seitlich abspreizen"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "abduktion",
    "muscles": {
      "primary": [
        "abduktoren",
        "gesaess"
      ],
      "secondary": []
    },
    "loads": [
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-standing-hip-abduction"
    }
  },
  {
    "id": "kniebeuge-koerpergewicht",
    "name": "Kniebeuge (Körpergewicht)",
    "en": "Bodyweight Squat",
    "aliases": [
      "Air Squat",
      "Kniebeuge ohne Gewicht"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps",
        "gesaess"
      ],
      "secondary": [
        "adduktoren"
      ]
    },
    "loads": [
      "knie",
      "huefte"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "bodyweight-squat"
    }
  },
  {
    "id": "beckenheben-einbeinig",
    "name": "Beckenheben einbeinig",
    "en": "Single-Leg Glute Bridge",
    "aliases": [
      "Einbeinige Glute Bridge"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess"
      ],
      "secondary": [
        "beinbeuger",
        "bauch"
      ]
    },
    "loads": [
      "huefte",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "single-leg-glute-bridge"
    }
  },
  {
    "id": "wandsitzen",
    "name": "Wandsitzen",
    "en": "Wall Sit",
    "aliases": [
      "Wall Sit",
      "Stuhl an der Wand"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "kniebeuge",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": [
        "gesaess"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "wall-sit"
    }
  },
  {
    "id": "unterarmstuetz",
    "name": "Unterarmstütz",
    "en": "Plank",
    "aliases": [
      "Planke",
      "Plank"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "schulter-vorne",
        "gesaess"
      ]
    },
    "loads": [
      "schulter",
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "plank"
    }
  },
  {
    "id": "seitstuetz",
    "name": "Seitstütz",
    "en": "Side Plank",
    "aliases": [
      "Seitlicher Unterarmstütz"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "seitliche-bauchmuskeln"
      ],
      "secondary": [
        "bauch",
        "gesaess",
        "schulter-seitlich"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 20,
    "media": {
      "source": "workout-guide",
      "ref": "side-plank"
    }
  },
  {
    "id": "crunch-kabel",
    "name": "Crunch am Kabel (kniend)",
    "en": "Cable Crunch",
    "aliases": [
      "Kabelcrunch"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": []
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-crunch"
    }
  },
  {
    "id": "crunch",
    "name": "Crunch",
    "en": "Crunch",
    "aliases": [
      "Bauchpresse"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": []
    },
    "loads": [
      "nacken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "crunch"
    }
  },
  {
    "id": "dead-bug",
    "name": "Dead Bug",
    "en": "Dead Bug",
    "aliases": [
      "Toter Käfer"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "seitliche-bauchmuskeln"
      ]
    },
    "loads": [],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "dead-bug"
    }
  },
  {
    "id": "bird-dog",
    "name": "Vierfüßlerstand diagonal (Bird Dog)",
    "en": "Bird Dog",
    "aliases": [
      "Bird Dog",
      "Vierfüßlerstand"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "unterer-ruecken",
        "bauch"
      ],
      "secondary": [
        "gesaess",
        "schulter-hinten"
      ]
    },
    "loads": [],
    "level": "einsteiger",
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "bird-dog"
    }
  },
  {
    "id": "beinheben-haengend",
    "name": "Beinheben hängend",
    "en": "Hanging Leg Raise",
    "aliases": [
      "Hanging Leg Raise",
      "Knieheben hängend"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "hanging-leg-raise"
    }
  },
  {
    "id": "pallof-press",
    "name": "Pallof Press",
    "en": "Pallof Press",
    "aliases": [
      "Anti-Rotation"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "rumpfrotation",
    "muscles": {
      "primary": [
        "seitliche-bauchmuskeln",
        "bauch"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "pallof-press"
    }
  },
  {
    "id": "hollow-body-hold",
    "name": "Hollow Body Hold",
    "en": "Hollow Body Hold",
    "aliases": [
      "Hollow Hold"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "seitliche-bauchmuskeln"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "fortgeschritten",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 20,
    "media": {
      "source": "workout-guide",
      "ref": "hollow-body-hold"
    }
  },
  {
    "id": "beinheben-liegend",
    "name": "Beinheben liegend",
    "en": "Lying Leg Raise",
    "aliases": [
      "Leg Raise"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "seitliche-bauchmuskeln"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "lying-leg-raise"
    }
  },
  {
    "id": "reverse-crunch",
    "name": "Reverse Crunch",
    "en": "Reverse Crunch",
    "aliases": [
      "Umgekehrter Crunch"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": []
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "reverse-crunch"
    }
  },
  {
    "id": "russian-twist",
    "name": "Russian Twist",
    "en": "Russian Twist",
    "aliases": [
      "Russische Drehung"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpfrotation",
    "muscles": {
      "primary": [
        "seitliche-bauchmuskeln"
      ],
      "secondary": [
        "bauch"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "russian-twist"
    }
  },
  {
    "id": "mountain-climber",
    "name": "Mountain Climber",
    "en": "Mountain Climber",
    "aliases": [
      "Bergsteiger"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "schulter-vorne",
        "quadrizeps"
      ]
    },
    "loads": [
      "handgelenk",
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "mountain-climber"
    }
  },
  {
    "id": "holzhacker-kabel",
    "name": "Holzhacker am Kabel",
    "en": "Cable Woodchop",
    "aliases": [
      "Woodchopper",
      "Holzhacken am Kabel"
    ],
    "equipment": "seilzug",
    "category": "kraft",
    "pattern": "rumpfrotation",
    "muscles": {
      "primary": [
        "seitliche-bauchmuskeln"
      ],
      "secondary": [
        "bauch",
        "schulter-vorne"
      ]
    },
    "loads": [
      "unterer-ruecken"
    ],
    "level": "einsteiger",
    "restSec": 60,
    "media": {
      "source": "workout-guide",
      "ref": "cable-woodchop"
    }
  },
  {
    "id": "knieheben-haengend",
    "name": "Knieheben hängend",
    "en": "Hanging Knee Raise",
    "aliases": [
      "Knee Raise"
    ],
    "equipment": "klimmzugstange",
    "category": "kraft",
    "pattern": "rumpfbeuge",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "unterarme"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "tags": [
      "calisthenics"
    ],
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "hanging-knee-raise"
    }
  },
  {
    "id": "ab-roller",
    "name": "Ab-Roller",
    "en": "Ab Wheel Rollout",
    "aliases": [
      "Bauchroller",
      "Ab Wheel"
    ],
    "equipment": "sonstiges",
    "category": "kraft",
    "pattern": "rumpf-stabilitaet",
    "muscles": {
      "primary": [
        "bauch"
      ],
      "secondary": [
        "lat",
        "schulter-vorne"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "schulter"
    ],
    "level": "fortgeschritten",
    "restSec": 60,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "ab-wheel"
    }
  },
  {
    "id": "fahrrad-crunch",
    "name": "Fahrrad-Crunch",
    "en": "Bicycle Crunch",
    "aliases": [
      "Bicycle Crunch"
    ],
    "equipment": "koerpergewicht",
    "category": "kraft",
    "pattern": "rumpfrotation",
    "muscles": {
      "primary": [
        "bauch",
        "seitliche-bauchmuskeln"
      ],
      "secondary": []
    },
    "loads": [
      "nacken"
    ],
    "level": "einsteiger",
    "restSec": 45,
    "noWeight": true,
    "media": {
      "source": "workout-guide",
      "ref": "bicycle-crunch"
    }
  },
  {
    "id": "kettlebell-swing",
    "name": "Kettlebell-Swing",
    "en": "Kettlebell Swing",
    "aliases": [
      "Swing",
      "KB-Swing"
    ],
    "equipment": "kettlebell",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "gesaess",
        "beinbeuger"
      ],
      "secondary": [
        "unterer-ruecken",
        "bauch",
        "schulter-vorne"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte"
    ],
    "level": "fortgeschritten",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "kettlebell-swing"
    }
  },
  {
    "id": "kettlebell-rumaenisches-kreuzheben",
    "name": "Rumänisches Kreuzheben (Kettlebell)",
    "en": "Kettlebell Romanian Deadlift",
    "aliases": [
      "Kettlebell-Kreuzheben"
    ],
    "equipment": "kettlebell",
    "category": "kraft",
    "pattern": "hueftstreckung",
    "muscles": {
      "primary": [
        "beinbeuger",
        "gesaess"
      ],
      "secondary": [
        "unterer-ruecken"
      ]
    },
    "loads": [
      "unterer-ruecken",
      "huefte"
    ],
    "level": "einsteiger",
    "restSec": 90,
    "media": {
      "source": "workout-guide",
      "ref": "kettlebell-romanian-deadlift"
    }
  },
  {
    "id": "katze-kuh",
    "name": "Katze-Kuh",
    "en": "Cat-Cow Stretch",
    "aliases": [
      "Katzenbuckel"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "unterer-ruecken"
      ],
      "secondary": [
        "oberer-ruecken"
      ]
    },
    "loads": [
      "handgelenk"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "cat-cow-stretch"
    }
  },
  {
    "id": "hueftbeuger-dehnung",
    "name": "Hüftbeuger-Dehnung kniend",
    "en": "Kneeling Hip Flexor Stretch",
    "aliases": [
      "Hüftbeuger dehnen"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "quadrizeps"
      ],
      "secondary": [
        "gesaess"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "kneeling-hip-flexor-stretch"
    }
  },
  {
    "id": "brustdehnung-tuer",
    "name": "Brustdehnung im Türrahmen",
    "en": "Doorway Chest Stretch",
    "aliases": [
      "Türrahmen-Dehnung"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "brust"
      ],
      "secondary": [
        "schulter-vorne"
      ]
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "doorway-chest-stretch"
    }
  },
  {
    "id": "schulter-querdehnung",
    "name": "Schulterdehnung quer",
    "en": "Cross-Body Shoulder Stretch",
    "aliases": [
      "Querdehnung Schulter"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "schulter-hinten"
      ],
      "secondary": []
    },
    "loads": [
      "schulter"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "cross-body-shoulder-stretch"
    }
  },
  {
    "id": "weltbeste-dehnung",
    "name": "World's Greatest Stretch",
    "en": "World's Greatest Stretch",
    "aliases": [
      "Weltbeste Dehnung"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "gesaess"
      ],
      "secondary": [
        "quadrizeps",
        "beinbeuger",
        "oberer-ruecken"
      ]
    },
    "loads": [
      "huefte",
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "worlds-greatest-stretch"
    }
  },
  {
    "id": "kindhaltung",
    "name": "Kindhaltung",
    "en": "Child's Pose",
    "aliases": [
      "Child's Pose",
      "Päckchen"
    ],
    "equipment": "koerpergewicht",
    "category": "mobilitaet",
    "pattern": "mobilitaet",
    "muscles": {
      "primary": [
        "unterer-ruecken"
      ],
      "secondary": [
        "lat"
      ]
    },
    "loads": [
      "knie"
    ],
    "level": "einsteiger",
    "restSec": 30,
    "noWeight": true,
    "mode": "hold",
    "holdSec": 30,
    "media": {
      "source": "workout-guide",
      "ref": "childs-pose"
    }
  }
]
