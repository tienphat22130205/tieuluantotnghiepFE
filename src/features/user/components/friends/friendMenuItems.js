import {
  AiOutlineGift,
  AiOutlineHome,
  AiOutlineRight,
  AiOutlineTeam,
  AiOutlineUnorderedList,
  AiOutlineUserAdd,
  AiOutlineStar,
} from 'react-icons/ai'

const FRIEND_MENU_ITEMS = [
  { key: 'home', label: 'Trang chủ', icon: AiOutlineHome },
  { key: 'requests', label: 'Lời mời kết bạn', icon: AiOutlineUserAdd },
  { key: 'suggestions', label: 'Gợi ý', icon: AiOutlineRight },
  { key: 'all', label: 'Tất cả bạn bè', icon: AiOutlineTeam },
  { key: 'close_friends', label: 'Bạn bè thân thiết', icon: AiOutlineStar },
  { key: 'birthdays', label: 'Sinh nhật', icon: AiOutlineGift },
  { key: 'custom', label: 'Danh sách tùy chỉnh', icon: AiOutlineUnorderedList },
]

export default FRIEND_MENU_ITEMS
