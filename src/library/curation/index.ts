import type { LibraryEntry } from '../types.ts'
import { ARME } from './arme.ts'
import { BEINE } from './beine.ts'
import { BRUST } from './brust.ts'
import { KETTLEBELL } from './kettlebell.ts'
import { RUECKEN } from './ruecken.ts'
import { RUMPF } from './rumpf.ts'
import { SCHULTERN } from './schultern.ts'

/**
 * Quelle der Wahrheit für die Übungsbibliothek. Wird nicht von der App importiert, sondern von
 * `npm run library` in `index.generated.ts` (sofort geladen) und `details.generated.ts`
 * (Tipps/Fehler, nachgeladen) aufgeteilt.
 */
export const CURATED: LibraryEntry[] = [...BRUST, ...RUECKEN, ...SCHULTERN, ...ARME, ...BEINE, ...RUMPF, ...KETTLEBELL]
