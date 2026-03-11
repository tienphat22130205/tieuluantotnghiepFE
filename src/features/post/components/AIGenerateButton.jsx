import { Button } from '@/components/ui'
import { HiOutlineSparkles } from 'react-icons/hi'

/**
 * AIGenerateButton – Nút gọi AI sinh nội dung (tính năng cốt lõi).
 * Props: isLoading (bool), onClick (fn)
 */
const AIGenerateButton = ({ isLoading, onClick }) => {
  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="secondary"
        onClick={onClick}
        isLoading={isLoading}
        className="gap-2"
      >
        <HiOutlineSparkles size={18} />
        {isLoading ? 'Đang phân tích ảnh...' : '✨ AI Sinh nội dung'}
      </Button>
    </div>
  )
}

export default AIGenerateButton
