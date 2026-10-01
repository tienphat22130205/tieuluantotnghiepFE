import { memo } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import { Button } from '@/components/ui'

/**
 * FriendsMobileHeader – Header dành riêng cho mobile hiển thị tiêu đề và nút mở danh mục drawer.
 */
const FriendsMobileHeader = memo(({
  title,
  onOpenMenu,
}) => {
  return (
    <div className="flex items-center justify-between lg:hidden mb-1 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl px-3 py-1.5 flex items-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
        onClick={onOpenMenu}
      >
        <AiOutlineMenu size={16} />
        <span>Danh mục</span>
      </Button>
    </div>
  )
})

FriendsMobileHeader.displayName = 'FriendsMobileHeader'

export default FriendsMobileHeader
