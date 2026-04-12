import { useState } from 'react'

const LoginForm = ({ form, onChange, onSubmit, isLoading }) => {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Nhập email"
          value={form.email}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Mật khẩu</label>
        <input
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
        />
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
            rememberMe ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              rememberMe ? 'translate-x-2.5' : '-translate-x-2.5'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-[#3A416F]">Ghi nhớ đăng nhập</span>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg shadow hover:bg-primary-700 hover:shadow-md transition-colors mt-2 flex justify-center disabled:opacity-70 cursor-pointer"
      >
        {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
      </button>
    </form>
  )
}

export default LoginForm
