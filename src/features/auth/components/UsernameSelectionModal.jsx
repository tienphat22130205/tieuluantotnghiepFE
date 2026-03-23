import { useState } from 'react'
import { AiOutlineCheckCircle, AiOutlineUser } from 'react-icons/ai'
import { Input, Button } from '@/components/ui'

/**
 * UsernameSelectionModal - Modal chọn username sau khi xác thực email (Bước 3).
 * 
 * Props:
 * - suggestedUsernames: Array gợi ý username
 * - onSelect: Function gọi khi chọn username
 * - isLoading: Boolean trạng thái loading
 * - error: String lỗi (nếu có)
 */
const UsernameSelectionModal = ({ suggestedUsernames = [], onSelect, isLoading, error }) => {
  const [selectedUsername, setSelectedUsername] = useState('')
  const [customUsername, setCustomUsername] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleSelectSuggested = (username) => {
    setSelectedUsername(username)
    setCustomUsername('')
    setShowCustom(false)
  }

  const handleSelectCustom = (username) => {
    setSelectedUsername(username)
    setCustomUsername(username)
  }

  const handleSubmit = () => {
    const usernameToSubmit = showCustom ? customUsername : selectedUsername
    if (usernameToSubmit.trim()) {
      onSelect(usernameToSubmit.trim())
    }
  }

  const isValid = showCustom ? customUsername.trim().length > 0 : selectedUsername.length > 0

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-100/95 px-4 py-6">
      <div className="w-full max-w-[560px] rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600">
              <AiOutlineCheckCircle size={24} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">Email xác thực thành công</p>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Bước tiếp theo: Chọn tên người dùng của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Suggested Usernames */}
        {suggestedUsernames.length > 0 && !showCustom && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-gray-900">Gợi ý tên người dùng:</p>
            <div className="space-y-2">
              {suggestedUsernames.map((username) => (
                <button
                  key={username}
                  type="button"
                  onClick={() => handleSelectSuggested(username)}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition ${
                    selectedUsername === username
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AiOutlineUser size={16} />
                      @{username}
                    </span>
                    {selectedUsername === username && (
                      <AiOutlineCheckCircle className="text-primary-600" size={18} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="mt-3 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Tạo tên người dùng khác
            </button>
          </div>
        )}

        {/* Custom Username Input */}
        {showCustom && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Nhập tên người dùng
            </label>
            <Input
              type="text"
              placeholder="username"
              value={customUsername}
              onChange={(e) => handleSelectCustom(e.target.value)}
              className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
              maxLength={30}
            />
            <p className="mt-2 text-xs text-gray-500">
              {customUsername.length}/30 ký tự
            </p>

            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="mt-3 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Quay lại gợi ý
            </button>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          fullWidth
          className="!py-3.5 !text-base !rounded-full !font-bold"
        >
          Tiếp tục
        </Button>

        {/* Info Box */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-gray-700">
          <AiOutlineCheckCircle className="text-accent-500" size={18} />
          Bạn có thể thay đổi tên người dùng sau trong cài đặt tài khoản.
        </div>
      </div>
    </div>
  )
}

export default UsernameSelectionModal
