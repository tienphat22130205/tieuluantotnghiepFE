import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

/**
 * Input Component – Ô nhập liệu dùng chung.
 *
 * Props:
 *   - label:       Nhãn hiển thị phía trên
 *   - error:       Thông báo lỗi (validation)
 *   - icon:        React Node – Icon bên trái
 *   - type:        'text' | 'email' | 'password' | ...
 *   - ...rest:     Các prop HTML gốc (value, onChange, placeholder, …)
 */
const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Icon bên trái */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}

        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full rounded-lg border border-gray-200
            bg-white text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
            py-2.5 text-sm
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...rest}
        />

        {/* Toggle show/hide password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={18} />
            ) : (
              <AiOutlineEye size={18} />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Input
