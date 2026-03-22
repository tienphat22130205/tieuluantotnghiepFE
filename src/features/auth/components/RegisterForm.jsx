import { Input, Button } from '@/components/ui'

/**
 * RegisterForm – Form đăng ký gồm username, email, phone, mật khẩu, xác nhận mật khẩu.
 */
const RegisterForm = ({ form, onChange, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="username"
        placeholder="Tên tài khoản"
        value={form.username}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

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
