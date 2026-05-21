import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { PageCard } from './PageCard'
import type { Range } from '../types'

const RANGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

interface Props {
  pageOrder: number[]
  thumbnails: string[]
  selectedPages: Set<number>
  ranges: Range[]
  onReorder: (newOrder: number[]) => void
  onSelect: (origIdx: number, e: React.MouseEvent) => void
}

export function ThumbnailGrid({ pageOrder, thumbnails, selectedPages, ranges, onReorder, onSelect }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = pageOrder.indexOf(Number(active.id))
    const newIdx = pageOrder.indexOf(Number(over.id))
    onReorder(arrayMove(pageOrder, oldIdx, newIdx))
  }

  function getRangeColors(origIdx: number): string[] {
    return ranges
      .map((r, i) => (r.pages.includes(origIdx) ? RANGE_COLORS[i % RANGE_COLORS.length] : null))
      .filter(Boolean) as string[]
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pageOrder.map(String)} strategy={rectSortingStrategy}>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(max(15vw, 160px), 1fr))' }}
        >
          {pageOrder.map((origIdx, position) => (
            <PageCard
              key={origIdx}
              id={String(origIdx)}
              thumbnail={thumbnails[origIdx] ?? ''}
              displayNumber={position + 1}
              selected={selectedPages.has(origIdx)}
              rangeColors={getRangeColors(origIdx)}
              onClick={e => onSelect(origIdx, e)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export { RANGE_COLORS }
