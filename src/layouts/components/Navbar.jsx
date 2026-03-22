import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineSearch,
  AiOutlinePlusCircle,
  AiFillPlusCircle,
  AiOutlineBell,
  AiFillBell,
  AiOutlineLogout,
  AiOutlineTeam,
  AiOutlineMessage,
  AiOutlineClockCircle,
  AiOutlineClose,
  AiOutlineArrowLeft,
  AiOutlineSend,
  AiOutlineDashboard,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { isAdminUser } from '@/utils/auth'

const Navbar = () => {
  const { user, handleLogout } = useAuth()
  const location = useLocation()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageInput, setMessageInput] = useState('')

  const isActive = (path) => location.pathname === path
  const isProfileActive = location.pathname.startsWith('/profile')

  const mockConversations = [
    { id: 1, name: 'Tiến Phát', message: 'Hello bro, tối nay code tiếp không?', avatar: 'https://i.pravatar.cc/150?img=33', online: true },
    { id: 2, name: 'Khánh Huyền', message: 'Mình vừa gửi tài liệu rồi nha', avatar: 'https://i.pravatar.cc/150?img=47', online: false },
    { id: 3, name: 'Lê Huyền', message: 'UI login nhìn ổn rồi đó', avatar: 'https://i.pravatar.cc/150?img=44', online: true },
    { id: 4, name: 'Thảo Nhiên', message: 'Mai họp nhóm lúc 8h nhé', avatar: 'https://i.pravatar.cc/150?img=15', online: false },
  ]

  const mockMessages = {
    1: [
      { id: 'm1', sender: 'them', text: 'Hello bro, tối nay code tiếp không?', time: '20:10' },
      { id: 'm2', sender: 'me', text: 'Có nha, mình đang làm phần chat UI đây.', time: '20:11' },
      { id: 'm3', sender: 'them', text: 'Ok ngon, có gì gửi mình review nhé.', time: '20:12' },
    ],
    2: [
      { id: 'm4', sender: 'them', text: 'Mình vừa gửi tài liệu rồi nha', time: '19:35' },
      { id: 'm5', sender: 'me', text: 'Mình nhận được rồi, cảm ơn bạn.', time: '19:36' },
    ],
    3: [
      { id: 'm6', sender: 'them', text: 'UI login nhìn ổn rồi đó', time: '18:20' },
      { id: 'm7', sender: 'me', text: 'Oke để mình polish thêm 1 chút.', time: '18:22' },
    ],
    4: [
      { id: 'm8', sender: 'them', text: 'Mai họp nhóm lúc 8h nhé', time: '17:10' },
      { id: 'm9', sender: 'me', text: 'Ok đúng 8h mình có mặt.', time: '17:11' },
    ],
  }

  const closeChatPanel = () => {
    setIsChatOpen(false)
    setSelectedConversation(null)
    setMessageInput('')
  }

  const navLinks = [
    { path: '/', icon: AiOutlineHome, activeIcon: AiFillHome, label: 'Trang chủ' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, label: 'Bạn bè' },
    { path: '/create', icon: AiOutlinePlusCircle, activeIcon: AiFillPlusCircle, label: 'Đăng bài' },
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, label: 'Thông báo' },
    ...(isAdminUser(user)
      ? [{ path: '/admin', icon: AiOutlineDashboard, activeIcon: AiOutlineDashboard, label: 'Quản trị' }]
      : []),
  ]

  return (
    <>
      {/* ══ TOP NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">

          {/* Logo & Search */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Zivo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Zivo</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex">
              <input
                type="text"
                placeholder="Tìm kiếm trên Zivo"
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition w-64"
              />
            </div>
          </div>

          {/* Desktop Nav Icons – Center */}
          <div className="hidden md:flex items-center gap-10">
                {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, label }) => {
                  const active = isActive(path)
                  return (
                    <Link
                      key={path}
                      to={path}
                      title={label}
                      className={`relative flex items-center justify-center w-30 h-12 rounded-lg transition-all cursor-pointer
                        ${ active ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' }
                      `}
                    >
                      {active
                        ? <ActiveIcon size={28} />
                        : <Icon size={29} />
                      }
                      {active && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* User menu */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={`/profile/${user?._id}`}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
                  <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsChatOpen((prev) => {
                      const next = !prev
                      if (!next) {
                        setSelectedConversation(null)
                        setMessageInput('')
                      }
                      return next
                    })
                  }}
                  title="Tin nhắn"
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <AiOutlineMessage size={21} />
                </button>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <AiOutlineLogout size={20} />
                </button>
              </div>

              {/* Mobile: Avatar only */}
              <Link to={`/profile/${user?._id}`} className="md:hidden">
                <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
              </Link>
        </div>
      </nav>

      <div
        onClick={closeChatPanel}
        className={`hidden md:block fixed inset-0 bg-black/10 transition-opacity duration-300 ${
          isChatOpen ? 'opacity-100 z-40 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'
        }`}
      />

      <div
        className={`hidden md:flex fixed top-14 right-0 h-[calc(100vh-56px)] w-[360px] bg-white border-l border-gray-200 shadow-2xl z-[60] flex-col transition-transform duration-300 ease-out ${
          isChatOpen && !selectedConversation ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Đoạn chat</h3>
          <button
            onClick={closeChatPanel}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>

        <div className="overflow-y-auto py-1">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left cursor-pointer"
            >
              <Avatar
                src={conversation.avatar}
                name={conversation.name}
                size="md"
                online={conversation.online}
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-gray-900 truncate">{conversation.name}</p>
                <p className="text-sm text-gray-500 truncate">{conversation.message}</p>
              </div>
              <AiOutlineClockCircle size={14} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`hidden md:flex fixed right-4 bottom-4 h-[460px] w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[70] flex-col transition-all duration-300 ease-out origin-bottom-right ${
          isChatOpen && selectedConversation ? 'translate-x-0 translate-y-0 opacity-100 scale-100' : 'translate-x-10 translate-y-6 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {selectedConversation && (
          <>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedConversation(null)
                    setMessageInput('')
                  }}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <AiOutlineArrowLeft size={18} />
                </button>
                <Avatar
                  src={selectedConversation.avatar}
                  name={selectedConversation.name}
                  size="sm"
                  online={selectedConversation.online}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedConversation.name}</p>
                  <p className="text-xs text-gray-500">{selectedConversation.online ? 'Đang hoạt động' : 'Hoạt động gần đây'}</p>
                </div>
              </div>
              <button
                onClick={closeChatPanel}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/40">
              {(mockMessages[selectedConversation.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'me'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`mt-1 text-[11px] ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button className="p-1.5 text-primary-600 hover:text-primary-700 transition">
                  <AiOutlineSend size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ BOTTOM NAV (Mobile) ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-14">
          {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, label }) => {
            const active = isActive(path)
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
              >
                {active
                  ? <ActiveIcon size={24} className="text-primary-600" />
                  : <Icon size={24} className="text-gray-500" />
                }
              </Link>
            )
          })}
          <Link
            to={`/profile/${user?._id}`}
            className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
          >
            <div className={isProfileActive ? 'ring-2 ring-primary-600 rounded-full' : ''}>
              <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
            </div>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navbar
