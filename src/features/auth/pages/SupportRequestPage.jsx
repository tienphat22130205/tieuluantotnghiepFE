import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import UnbanRequestForm from '../components/UnbanRequestForm'
import ForgotPasswordSupportForm from '../components/ForgotPasswordSupportForm'
import OtherSupportForm from '../components/OtherSupportForm'

const SupportRequestPage = () => {
  const [supportType, setSupportType] = useState('')

  const supportOptions = useMemo(
    () => [
      {
        id: 'unlock-account',
        title: 'Mở khóa tài khoản',
        description: 'Gửi yêu cầu để admin xem xét mở khóa tài khoản.',
        isAvailable: true,
      },
      {
        id: 'forgot-password',
        title: 'Quên mật khẩu',
        description: 'Khôi phục mật khẩu qua email hoặc xác minh bổ sung.',
        isAvailable: true,
      },
      {
        id: 'other-support',
        title: 'Hỗ trợ khác',
        description: 'Liên hệ cho các vấn đề đăng nhập hoặc bảo mật khác.',
        isAvailable: true,
      },
    ],
    []
  )

  const selectedOption = supportOptions.find((item) => item.id === supportType) || null

  const renderSelectedSupportForm = () => {
    if (!selectedOption) {
      return (
        <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 px-3 py-4">
          <p className="text-sm font-semibold text-slate-700">Chọn hình thức hỗ trợ để tiếp tục</p>
          <p className="mt-1 text-sm text-slate-500">
            Bạn hãy chọn một option phía trên, hệ thống sẽ hiển thị form phù hợp với nhu cầu hỗ trợ.
          </p>
        </div>
      )
    }

    if (selectedOption.id === 'unlock-account') {
      return <UnbanRequestForm />
    }

    if (selectedOption.id === 'forgot-password') {
      return <ForgotPasswordSupportForm />
    }

    return <OtherSupportForm />
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Yêu cầu hỗ trợ</h1>
      <p className="mb-6 text-sm font-medium text-slate-500">
        Chọn hình thức hỗ trợ phù hợp. Hệ thống sẽ mở rộng thêm các phương thức hỗ trợ khác trong các phiên bản tiếp theo.
      </p>

      {!selectedOption ? (
        <div className="space-y-2">
          {supportOptions.map((option) => {
            const isSelected = option.id === supportType

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSupportType(option.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/60 ring-2 ring-primary-500/20'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{option.title}</p>
                  {option.isAvailable ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Khả dụng
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Sắp ra mắt
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{option.description}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-sm font-semibold text-slate-700">Đang chọn: {selectedOption.title}</p>
            <button
              type="button"
              onClick={() => setSupportType('')}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              Chọn lại
            </button>
          </div>

          {renderSelectedSupportForm()}
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Quay lại trang đăng nhập?{' '}
        <Link to="/login" className="font-bold text-primary-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </>
  )
}

export default SupportRequestPage
