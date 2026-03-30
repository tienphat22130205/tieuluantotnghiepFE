import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const AICaptionSuggestions = ({
  captions = [],
  hashtags = [],
  selectedIndex,
  isLoading = false,
  skeletonCount = 2,
  onUseCaption,
}) => {
  if (!isLoading && captions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-700">Caption gợi ý từ AI</p>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-3">
              <Skeleton height={14} count={2} className="mb-1" />
              <Skeleton height={28} width={120} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-2">
        {captions.map((caption, index) => {
          const isSelected = selectedIndex === index

          return (
            <div
              key={`${caption}-${index}`}
              className={`rounded-lg border p-3 ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200'}`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{caption}</p>
              <button
                type="button"
                onClick={() => onUseCaption(caption, index)}
                className={`mt-2 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isSelected ? 'Đang sử dụng caption này' : 'Dùng caption này'}
              </button>
            </div>
          )
        })}
        </div>
      )}

      {!isLoading && hashtags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Hashtags gợi ý</p>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AICaptionSuggestions
