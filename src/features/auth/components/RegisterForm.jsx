import { Input, Button } from '@/components/ui'

/**
 * RegisterForm – Form đăng ký gồm firstName, lastName, email, phone, dateOfBirth, mật khẩu, xác nhận mật khẩu.
 */
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="firstName"
          placeholder="Họ"
          value={form.firstName}
          onChange={onChange}
          required
          className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
        />

        <Input
          name="lastName"
          placeholder="Tên"
          value={form.lastName}
          onChange={onChange}
          required
          className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
        />
      </div>

      <Input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

      <Input
        name="phone"
        type="tel"
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

        {/* Date of Birth selectors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Day */}
            <select
              name="day"
              value={form.day || ''}
              onChange={onChange}
              required
              className="block w-full rounded-full border border-gray-300 bg-white px-5 py-4 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
            >
              <option value="">Ngày</option>
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              name="month"
              value={form.month || ''}
              onChange={onChange}
              required
              className="block w-full rounded-full border border-gray-300 bg-white px-5 py-4 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
            >
              <option value="">Tháng</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              name="year"
              value={form.year || ''}
              onChange={onChange}
              required
              className="block w-full rounded-full border border-gray-300 bg-white px-5 py-4 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
            >
              <option value="">Năm</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

      <Input
        name="password"
        type="password"
        placeholder="Mật khẩu mới"
        value={form.password}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

      <Input
        name="confirmPassword"
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={form.confirmPassword}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

      <Button type="submit" fullWidth isLoading={isLoading} className="!py-3.5 !text-base !rounded-full !font-bold">
        Đăng ký
      </Button>
    </form>
  )
}

export default RegisterForm
