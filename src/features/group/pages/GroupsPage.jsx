import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineUsergroupAdd,
  AiOutlineClose,
  AiOutlineCloudUpload,
} from 'react-icons/ai'
import { searchGroups, fetchMyGroups, createGroup } from '../store/groupSlice'
import GroupCard from '../components/GroupCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usePreferences } from '@/context/PreferencesContext'

const GroupsPage = () => {
  const dispatch = useDispatch()
  const { t } = usePreferences()
  const { groups, myGroups, isLoading } = useSelector((state) => state.group)

  const [activeTab, setActiveTab] = useState('discover') // 'joined' | 'discover'
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Creation form state
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('public')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch groups based on activeTab
  useEffect(() => {
    if (activeTab === 'discover') {
      dispatch(searchGroups({ q: searchKeyword }))
    } else {
      dispatch(fetchMyGroups({ q: searchKeyword }))
    }
  }, [dispatch, activeTab, searchKeyword])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm!')
      return
    }

    const formData = new FormData()
    formData.append('name', newGroupName.trim())
    formData.append('description', newGroupDesc.trim())
    formData.append('privacy', newGroupPrivacy)
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }
    if (coverFile) {
      formData.append('coverImage', coverFile)
    }

    setSubmitting(true)
    try {
      await dispatch(createGroup(formData)).unwrap()
      toast.success(`Tạo thành công nhóm "${newGroupName.trim()}"!`)
      
      // Reset form
      setNewGroupName('')
      setNewGroupDesc('')
      setNewGroupPrivacy('public')
      setAvatarFile(null)
      setAvatarPreview(null)
      setCoverFile(null)
      setCoverPreview(null)
      setShowCreateModal(false)
      setActiveTab('joined') // Switch to My Groups
      dispatch(fetchMyGroups())
    } catch (err) {
      toast.error(err?.message || 'Lỗi tạo nhóm!')
    } finally {
      setSubmitting(false)
    }
  }

  const displayList = activeTab === 'discover' ? groups : myGroups

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
              <AiOutlineUsergroupAdd size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t('groups.title')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">{t('groups.subtitle')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-700 transition cursor-pointer"
          >
            <AiOutlinePlus size={16} />
            {t('groups.createNew')}
          </button>
        </div>
      </header>

      {/* Layout Main */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Left column - List */}
        <div className="space-y-4">
          {/* Filters & search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'discover' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('groups.discoverTab')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'joined' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('groups.myGroupsTab')}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('groups.searchPlaceholder')}
                className="w-full sm:w-60 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
              />
              <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
              <AiOutlineUsergroupAdd size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Không tìm thấy nhóm</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Không tìm thấy kết quả nào hoặc danh sách trống. Hãy tạo nhóm mới hoặc tìm kiếm với từ khóa khác!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayList.map((group) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          )}
        </div>

        {/* Right column - Rules */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('groups.rulesTitle')}</h3>
            <ul className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 list-none pl-0 font-normal">
              <li>{t('groups.rule1')}</li>
              <li>{t('groups.rule2')}</li>
              <li>{t('groups.rule3')}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-[500px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-slate-900 text-base">Tạo nhóm mới</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên nhóm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm muốn tạo..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mô tả nhóm
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Giới thiệu đôi nét về mục đích hoạt động của nhóm..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quyền riêng tư
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      newGroupPrivacy === 'public'
                        ? 'border-primary-600 bg-primary-50/20 text-primary-700 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={newGroupPrivacy === 'public'}
                      onChange={() => setNewGroupPrivacy('public')}
                      className="accent-primary-600 cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs text-slate-800">Công khai</p>
                      <p className="text-[9px] text-slate-400 font-normal">Mọi người có thể tìm và join</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      newGroupPrivacy === 'private'
                        ? 'border-primary-600 bg-primary-50/20 text-primary-700 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={newGroupPrivacy === 'private'}
                      onChange={() => setNewGroupPrivacy('private')}
                      className="accent-primary-600 cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs text-slate-800">Riêng tư</p>
                      <p className="text-[9px] text-slate-400 font-normal">Chờ duyệt từ quản trị viên</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Avatar upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ảnh đại diện nhóm
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex flex-col items-center justify-center w-14 h-14 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    <AiOutlineCloudUpload className="text-slate-400" size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Chưa chọn ảnh đại diện</span>
                  )}
                </div>
              </div>

              {/* Cover upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ảnh bìa nhóm
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex flex-col items-center justify-center w-24 h-14 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    <AiOutlineCloudUpload className="text-slate-400" size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-24 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Chưa chọn ảnh bìa</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary-600 hover:bg-primary-700 px-5 py-2 text-xs font-bold text-white transition shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsPage
