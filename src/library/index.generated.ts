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
  }
]
