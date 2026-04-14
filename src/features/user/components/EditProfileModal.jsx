import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const EditProfileModal = ({
  isOpen,
  isSaving,
  profileForm,
  onClose,
  onChange,
  onSave,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 z-[60] bg-black/50 will-change-opacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              onEscapeKeyDown={(event) => {
                if (isSaving) event.preventDefault()
              }}
              onPointerDownOutside={(event) => {
                if (isSaving) event.preventDefault()
              }}
            >
              <Motion.div
                className="fixed left-1/2 top-1/2 z-[61] w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl will-change-transform"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.18 }}
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">Chỉnh sửa trang cá nhân</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-gray-500">
                    Cập nhật thông tin hiển thị trên hồ sơ của bạn.
                  </Dialog.Description>
                </div>

                <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
                  <div>
                    <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={profileForm.bio}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                      placeholder="Viết vài dòng giới thiệu về bạn..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-gray-700">Địa chỉ</label>
                      <input
                        id="address"
                        name="address"
                        value={profileForm.address}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                        placeholder="123 Nguyen Hue"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-gray-700">Thành phố</label>
                      <input
                        id="city"
                        name="city"
                        value={profileForm.city}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                        placeholder="Ho Chi Minh"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-gray-700">Quốc gia</label>
                      <input
                        id="country"
                        name="country"
                        value={profileForm.country}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                        placeholder="Viet Nam"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="lat" className="mb-1.5 block text-sm font-medium text-gray-700">Lat</label>
                        <input
                          id="lat"
                          name="lat"
                          type="number"
                          step="any"
                          value={profileForm.lat}
                          onChange={onChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                          placeholder="10.7769"
                        />
                      </div>

                      <div>
                        <label htmlFor="lng" className="mb-1.5 block text-sm font-medium text-gray-700">Lng</label>
                        <input
                          id="lng"
                          name="lng"
                          type="number"
                          step="any"
                          value={profileForm.lng}
                          onChange={onChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                          placeholder="106.7009"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default EditProfileModal