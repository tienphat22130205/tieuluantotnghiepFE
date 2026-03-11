import { Input, Button } from '@/components/ui'

/**
 * LoginForm – Form đăng nhập gồm email, mật khẩu và nút submit.
 *
 * Props:
 *   - form: { email, password }
 *   - onChange: handler cập nhật form
 *   - onSubmit: handler submit form
 *   - isLoading: đang xử lý
 */
const LoginForm = ({ form, onChange, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        placeholder="Email hoặc số điện thoại"
        value={form.email}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

      <Input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        value={form.password}
        onChange={onChange}
        required
        className="!py-4 !text-[15px] !rounded-full !border-gray-300 !px-5"
      />

      <Button type="submit" fullWidth isLoading={isLoading} className="!py-3.5 !text-base !rounded-full !font-bold">
        Đăng nhập
      </Button>

      <div className="text-center">
        <a href="#" className="text-primary-600 text-sm hover:underline cursor-pointer">
          Quên mật khẩu?
        </a>
      </div>
    </form>
  )
}

export default LoginForm
