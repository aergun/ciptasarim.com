/**
 * The generated drawing's data URI, exposed for cards.
 *
 * Kept separate from `CoreImage` because several pages want the drawing
 * without the `<img>`-with-fallback dance, and because `drawingFor` is pure
 * while this is the memoised handle a list uses per card.
 */

import { useMemo } from 'react'
import type { Core } from '../../shared/types.ts'
import { drawingFor } from './drawings.ts'

export function useCoreDrawing(core: Core): string {
  return useMemo(() => drawingFor(core), [core])
}