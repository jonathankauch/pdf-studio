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
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all select-none ${
        selected
          ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.03]'
          : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={`Page ${displayNumber}`}
          className="w-full block bg-white"
          draggable={false}
        />
      ) : (
        <div className="w-full aspect-[3/4] bg-gray-100 animate-pulse" />
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-4 pb-1 text-center">
        <span className="text-white text-xs font-medium">{displayNumber}</span>
      </div>

      {rangeColors.length > 0 && (
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          {rangeColors.map((color, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-white" style={{ background: color }} />
          ))}
        </div>
      )}

      {selected && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}
