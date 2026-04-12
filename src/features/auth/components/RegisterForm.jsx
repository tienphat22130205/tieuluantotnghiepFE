import { useState } from 'react'

const RegisterForm = ({ form, onChange, onSubmit, isLoading }) => {
  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)
  
  // Generate month options (1-12)
  const monthOptions = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ]
  
  // Generate year options (from 13 years ago to 100 years ago)
  const today = new Date()
  const currentYear = today.getFullYear()
  const yearOptions = Array.from({ length: 88 }, (_, i) => currentYear - 13 - i)

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Họ</label>
          <input
            name="firstName"
            placeholder="Họ"
            value={form.firstName}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Tên</label>
          <input
            name="lastName"
            placeholder="Tên"
            value={form.lastName}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
          />
        </div>
      </div>

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
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Số điện thoại</label>
        <input
          name="phone"
          type="tel"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
        />
      </div>

      {/* Date of Birth selectors */}
      <div>
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Ngày sinh</label>
        <div className="grid grid-cols-3 gap-3">
          <select
            name="day"
            value={form.day || ''}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="">Ngày</option>
            {dayOptions.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <select
            name="month"
            value={form.month || ''}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="">Tháng</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>

          <select
            name="year"
            value={form.year || ''}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="">Năm</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Mật khẩu</label>
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-[#3A416F] uppercase">Xác nhận mật khẩu</label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg shadow hover:bg-primary-700 hover:shadow-md transition-colors mt-2 flex justify-center disabled:opacity-70 cursor-pointer"
      >
        {isLoading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ'}
      </button>
    </form>
  )
}

export default RegisterForm
