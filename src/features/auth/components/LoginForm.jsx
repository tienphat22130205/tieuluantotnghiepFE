import { useState } from 'react'

const LoginForm = ({ form, onChange, onSubmit, isLoading }) => {
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Nhập email"
          value={form.email}
          onChange={onChange}
          required
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mật khẩu</label>
        <input
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={onChange}
          required
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            rememberMe ? 'bg-primary-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              rememberMe ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-slate-600">Ghi nhớ đăng nhập</span>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex w-full justify-center rounded-full bg-primary-600 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
      </button>
    </form>
  )
}

export default LoginForm
