const ForgotPasswordSupportForm = () => {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Form khôi phục mật khẩu</h3>
      <p className="mt-1 text-xs text-slate-500">
        Tính năng đang hoàn thiện. Bản hiện tại sẽ hỗ trợ qua email đăng ký.
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email đăng ký</label>
          <input
            type="email"
            placeholder="user@example.com"
            disabled
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
          />
        </div>

        <button
          type="button"
          disabled
          className="rounded-full bg-slate-300 px-5 py-2.5 text-sm font-bold text-white"
        >
          Gửi mã khôi phục (sắp ra mắt)
        </button>
      </div>
    </div>
  )
}

export default ForgotPasswordSupportForm
