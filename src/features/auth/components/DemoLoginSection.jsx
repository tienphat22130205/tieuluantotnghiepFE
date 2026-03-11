import { HiOutlineSparkles } from 'react-icons/hi'
import { Button } from '@/components/ui'

/**
 * DemoLoginSection – Nút đăng nhập Demo Mode (không cần backend).
 *
 * Props:
 *   - onDemoLogin: handler đăng nhập demo
 */
const DemoLoginSection = ({ onDemoLogin }) => {
  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc</span>
        </div>
      </div>

      {/* Demo Mode Button */}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={onDemoLogin}
        className="gap-2"
      >
        <HiOutlineSparkles size={18} />
        Xem Demo (Không cần Backend)
      </Button>
    </>
  )
}

export default DemoLoginSection
