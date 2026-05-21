import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  thumbnail: string
  displayNumber: number
  selected: boolean
  rangeColors: string[]
  onClick: (e: React.MouseEvent) => void
}

export function PageCard({ id, thumbnail, displayNumber, selected, rangeColors, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, 'box-shadow 0.15s', 'border-color 0.15s'].filter(Boolean).join(', '),
        opacity: isDragging ? 0.35 : 1,
        borderRadius: 12,
        overflow: 'hidden',
        border: selected ? '2px solid #0071e3' : '2px solid transparent',
        boxShadow: selected
          ? '0 0 0 3px rgba(0,113,227,0.18), 0 4px 16px rgba(0,0,0,0.10)'
          : '0 1px 4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        background: '#fff',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={`Page ${displayNumber}`}
          className="w-full block"
          draggable={false}
        />
      ) : (
        <div className="w-full aspect-[3/4] animate-pulse" style={{ background: '#f5f5f7' }} />
      )}

      {/* Page number */}
      <div
        className="text-center py-1.5 text-xs font-medium"
        style={{
          background: selected ? '#0071e3' : '#f5f5f7',
          color: selected ? '#fff' : '#86868b',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {displayNumber}
      </div>

      {/* Range color dots */}
      {rangeColors.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-1">
          {rangeColors.map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color, boxShadow: '0 0 0 1.5px rgba(255,255,255,0.9)' }}
            />
          ))}
        </div>
      )}

      {/* Checkmark */}
      {selected && (
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: '#0071e3', boxShadow: '0 1px 4px rgba(0,113,227,0.4)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="2,5.5 4,7.5 8,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}
