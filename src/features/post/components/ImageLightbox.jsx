import { useEffect } from 'react'
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai'

/**
 * ImageLightbox – Modal image viewer with dark overlay.
 * Props: isOpen, images (array), currentIndex, onClose, onPrev, onNext
 */
const ImageLightbox = ({ isOpen, images, currentIndex, onClose, onPrev, onNext }) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrev, onNext])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen || !images || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center px-4">
          {/* Image wrapper for close button positioning */}
          <div className="relative">
            {/* Main image */}
            <img
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[60vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close button - positioned on image corner */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white hover:text-red-500 transition p-1.5 rounded-full z-50 drop-shadow-md"
              aria-label="Close"
              title="Đóng (Esc)"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrev()
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition p-2 rounded-full hover:bg-black/30"
              aria-label="Previous image"
            >
              <AiOutlineLeft size={32} />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition p-2 rounded-full hover:bg-black/30"
              aria-label="Next image"
            >
              <AiOutlineRight size={32} />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ImageLightbox
