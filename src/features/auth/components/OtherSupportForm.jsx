const OtherSupportForm = () => {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Form hỗ trợ khác</h3>
      <p className="mt-1 text-xs text-slate-500">
        Chức năng này đang được mở rộng để hỗ trợ nhiều loại yêu cầu hơn.
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tiêu đề hỗ trợ</label>
          <input
            type="text"
            placeholder="Ví dụ: Không nhận được email xác thực"
            disabled
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả</label>
          <textarea
            rows={3}
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp"
            disabled
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
          />
        </div>

        <button
          type="button"
          disabled
          className="rounded-full bg-slate-300 px-5 py-2.5 text-sm font-bold text-white"
        >
          Gửi hỗ trợ (sắp ra mắt)
        </button>
      </div>
    </div>
  )
}

export default OtherSupportForm
