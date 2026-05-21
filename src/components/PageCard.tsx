import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  thumbnail: string
  displayNumber: number
  selected: boolean
  rangeColors: string[]
  onClick: (e: React.MouseEvent) => void
  onZoom: () => void
}

export function PageCard({ id, thumbnail, displayNumber, selected, rangeColors, onClick, onZoom }: Props) {
  const [hovered, setHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const primaryRangeColor = rangeColors[0] ?? null

  // Border: blue when selected, range color when in a range, subtle grey otherwise
  const border = selected
    ? '2.5px solid #0071e3'
    : primaryRangeColor
      ? `2.5px solid ${primaryRangeColor}`
      : '2px solid rgba(0,0,0,0.07)'

  // Box shadow: blue glow when selected, range glow when in range
  const boxShadow = selected
    ? `0 0 0 3px rgba(0,113,227,0.18), 0 4px 16px rgba(0,0,0,0.10)`
    : primaryRangeColor
      ? `0 0 0 3px ${primaryRangeColor}28, 0 2px 8px rgba(0,0,0,0.08)`
      : '0 1px 4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)'

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, 'box-shadow 0.15s', 'border-color 0.15s'].filter(Boolean).join(', '),
        opacity: isDragging ? 0.35 : 1,
        borderRadius: 12,
        overflow: 'hidden',
        border,
        boxShadow,
        background: '#fff',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

      {/* Magnify button — top right, shown on hover */}
      {hovered && thumbnail && (
        <button
          onClick={e => { e.stopPropagation(); onZoom() }}
          className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-90"
          style={{
            background: 'rgba(0,0,0,0.52)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
          }}
          title="Preview page"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <line x1="16.5" y1="16.5" x2="22" y2="22"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      )}

      {/* Page number bar */}
      <div
        className="text-center py-1.5 text-xs font-medium"
        style={{
          background: selected ? '#0071e3' : primaryRangeColor ? `${primaryRangeColor}18` : '#f5f5f7',
          color: selected ? '#fff' : primaryRangeColor ?? '#86868b',
          borderTop: `1px solid ${primaryRangeColor ? `${primaryRangeColor}30` : 'rgba(0,0,0,0.05)'}`,
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {displayNumber}
      </div>

      {/* Multi-range color dots (when in more than one range) */}
      {rangeColors.length > 1 && (
        <div className="absolute bottom-7 left-2 flex gap-1">
          {rangeColors.map((color, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
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
