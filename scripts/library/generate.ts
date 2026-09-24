// Erzeugt aus src/library/curation/*.ts die Dateien index.generated.ts und details.generated.ts
// und ergänzt neue IDs in ids.frozen.json (IDs werden nie entfernt). Aufruf: npm run library
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CURATED } from '../../src/library/curation/index.ts'
import { splitLibrary } from '../../src/library/split.ts'

const DIR = join(import.meta.dirname, '../../src/library')
const HEADER = '// Automatisch erzeugt mit `npm run library` aus src/library/curation – nicht von Hand ändern.\n'

const ids = CURATED.map((e) => e.id)
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupes.length) throw new Error(`Doppelte IDs: ${dupes.join(', ')}`)

const { index, details } = splitLibrary(CURATED)
writeFileSync(
  join(DIR, 'index.generated.ts'),
  `${HEADER}import type { LibraryIndexEntry } from './types.ts'\n\nexport const LIBRARY_INDEX: LibraryIndexEntry[] = ${JSON.stringify(index, null, 2)}\n`,
)
writeFileSync(
  join(DIR, 'details.generated.ts'),
  `${HEADER}import type { LibraryDetails } from './types.ts'\n\nexport const LIBRARY_DETAILS: Record<string, LibraryDetails> = ${JSON.stringify(details, null, 2)}\n`,
)

const frozenPath = join(DIR, 'ids.frozen.json')
const frozen: string[] = existsSync(frozenPath) ? JSON.parse(readFileSync(frozenPath, 'utf8')) : []
const added = ids.filter((id) => !frozen.includes(id))
writeFileSync(frozenPath, JSON.stringify([...frozen, ...added], null, 2) + '\n')
console.log(`Bibliothek: ${index.length} Einträge, ${added.length} neue IDs eingefroren.`)
