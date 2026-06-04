import { AiOutlineGlobal } from 'react-icons/ai'

const ExplorePage = () => {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <AiOutlineGlobal size={24} className="text-primary-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Khám phá</h1>
            <p className="text-sm text-slate-500 font-normal">Khám phá xu hướng, nội dung và những người dùng mới trên Zivo.</p>
          </div>
        </div>
      </header>

      <main className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-2">
            <AiOutlineGlobal size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tính năng đang được phát triển</h2>
          <p className="text-sm text-slate-500">
            Trang Khám phá sẽ sớm cập nhật các xu hướng nổi bật, bài viết được quan tâm nhiều nhất và gợi ý kết nối dành riêng cho bạn.
          </p>
        </div>
      </main>
    </div>
  )
}

export default ExplorePage
