/**
 * DemoBanner – Banner thông báo chế độ Demo.
 */
const DemoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
      <div className="text-2xl">✨</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">Chế độ Demo</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Bạn đang xem dữ liệu mẫu. Các tính năng như đăng bài, like, comment sẽ không lưu thực tế.
          Để sử dụng đầy đủ, vui lòng kết nối Backend.
        </p>
      </div>
    </div>
  )
}

export default DemoBanner
