import { BsRobot } from 'react-icons/bs'
import { TbSparkles } from 'react-icons/tb'

/**
 * AIGenerateButton – Nút kích hoạt AI sinh caption.
 * Style: clean, tech-inspired, sử dụng màu primary của website.
 */
const AIGenerateButton = ({ onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Robot icon với nền tròn */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150">
        <BsRobot size={18} className="text-white" />
      </div>

      {/* Text */}
      <div className="text-left min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary-700">Sinh caption với AI</span>
          <TbSparkles size={13} className="text-primary-500 shrink-0" />
        </div>
        <p className="text-[11px] text-primary-500 font-normal mt-0.5 truncate">
          AI phân tích ảnh và gợi ý nội dung phù hợp
        </p>
      </div>

      {/* Arrow */}
      <svg className="shrink-0 text-primary-400 group-hover:translate-x-0.5 transition-transform duration-150" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

export default AIGenerateButton
