import { useRef } from 'react'
import { AiOutlineCloudUpload, AiOutlineClose, AiOutlinePlus } from 'react-icons/ai'

/**
 * ImageUploader – Khu vực upload và preview ảnh.
 * Props: previews (array url), onImageChange (fn), onRemoveImage (fn)
 */
const ImageUploader = ({ previews = [], onImageChange, onRemoveImage }) => {
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const acceptedFiles = []

    // Validate files
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        continue
      }
      acceptedFiles.push(file)
    }

    if (acceptedFiles.length === 0) {
      alert('Chỉ chấp nhận ảnh JPG/PNG/WebP, mỗi ảnh tối đa 5MB!')
      return
    }

    onImageChange(acceptedFiles)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Hình ảnh
      </label>

      {previews.length === 0 ? (
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
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/40 transition flex flex-col items-center justify-center"
            >
              <AiOutlinePlus size={24} />
              <span className="text-xs mt-1">Thêm ảnh</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
            >
              <AiOutlinePlus size={16} />
              Chọn thêm ảnh
            </button>
            <button
              type="button"
              onClick={() => {
                onRemoveImage()
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <AiOutlineClose size={16} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader
