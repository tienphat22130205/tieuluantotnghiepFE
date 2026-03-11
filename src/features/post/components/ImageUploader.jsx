import { useRef } from 'react'
import { AiOutlineCloudUpload, AiOutlineClose } from 'react-icons/ai'

/**
 * ImageUploader – Khu vực upload và preview ảnh.
 * Props: preview (url), onImageChange (fn), onRemoveImage (fn)
 */
const ImageUploader = ({ preview, onImageChange, onRemoveImage }) => {
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP!')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB!')
      return
    }

    onImageChange(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Hình ảnh
      </label>

      {!preview ? (
        // Drop zone
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
        >
          <AiOutlineCloudUpload className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-sm text-gray-500">
            Click để chọn ảnh hoặc kéo thả vào đây
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP – Tối đa 5MB
          </p>
        </div>
      ) : (
        // Preview ảnh đã chọn
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-[400px] object-cover"
          />
          <button
            type="button"
            onClick={() => {
              onRemoveImage()
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader
