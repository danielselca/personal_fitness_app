import { exerciseMeta } from '../domain/library.ts'
import { mediaForExercise } from '../domain/media.ts'
import type { Exercise } from '../domain/types.ts'
import { ExerciseMedia } from './ExerciseMedia.tsx'
import { HowTo, MetaRows } from './LibraryInfo.tsx'
import { Sheet } from './Sheet.tsx'

/** „Ausführung“ im Training: große Bewegungsgrafik, Tipps, typische Fehler, Muskeln. */
export function ExecutionSheet({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const meta = exerciseMeta(exercise)
  const media = mediaForExercise(exercise)
  return (
    <Sheet title={exercise.name} onClose={onClose}>
      {media && <ExerciseMedia media={media} name={exercise.name} />}
      <dl className="kv" style={{ marginBottom: 4 }}>
        <MetaRows meta={meta} />
      </dl>
      {meta.library && <HowTo libraryId={meta.library.id} />}
    </Sheet>
  )
}
