import { BsLightningCharge, BsMusicNoteBeamed } from 'react-icons/bs'
import { FaUserFriends } from 'react-icons/fa'
import { FiTrendingUp } from 'react-icons/fi'

export const FALLBACK_VIDEOS = [
  {
    id: 'sample-video-1',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-4712-large.mp4',
    title: 'Một ngày dạo quanh phố phường Hà Nội yên bình ngày cuối thu 🍁✨ #hanoi #vibes #travelvietnam',
    user: { name: 'Thanh Tùng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', username: 'thanhtung.travel' },
    likes: 1250, commentsCount: 89, shares: 45,
    tag: 'hanoi',
  },
  {
    id: 'sample-video-2',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-table-in-a-coffee-shop-4011-large.mp4',
    title: 'Cốc cà phê ấm nóng ngày mưa rả rích ☕️🌧️ Bình yên nhỏ nhoi góc quán quen. #coffee #chill #rainyday',
    user: { name: 'Minh Thư', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thu', username: 'thu.coffee' },
    likes: 840, commentsCount: 42, shares: 18,
    tag: 'coffee',
  },
  {
    id: 'sample-video-3',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    title: 'Góc nhỏ Đà Lạt mộng mơ, trốn thành phố xô bồ tìm bình yên 🌲🍃 #dalat #dalatlife #healing',
    user: { name: 'Khánh Linh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', username: 'linh.dalat' },
    likes: 2305, commentsCount: 148, shares: 92,
    tag: 'dalat',
  },
  {
    id: 'sample-video-4',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    title: 'Ngắm hoàng hôn rực rỡ buông xuống bãi biển Nha Trang thơ mộng 🌅🌊 #sunset #beachlife #travel',
    user: { name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=nam', username: 'nam.ocean' },
    likes: 1520, commentsCount: 75, shares: 38,
    tag: 'sunset',
  },
  {
    id: 'sample-video-5',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-grass-in-a-park-41312-large.mp4',
    title: 'Chú cún con Golden đáng yêu chạy nhảy giữa vườn hoa đầy nắng 🐶🌸 #doglover #pet #goldenretriever',
    user: { name: 'Bảo Ngọc', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', username: 'ngoc.golden' },
    likes: 3110, commentsCount: 230, shares: 115,
    tag: 'pets',
  },
  {
    id: 'sample-video-6',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-preparing-food-in-a-kitchen-41484-large.mp4',
    title: 'Nấu ăn cực chill cuối tuần: Mỳ Ý sốt kem nấm béo ngậy siêu dễ làm 🍝🧀 #cooking #foodie #chill',
    user: { name: 'Chef Duy Anh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', username: 'duyanh.cook' },
    likes: 912, commentsCount: 56, shares: 24,
    tag: 'cooking',
  },
]

export const FEATURED_CREATORS = [
  { id: 1, name: 'Thanh Tùng', username: 'thanhtung.travel', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', followers: '124K' },
  { id: 2, name: 'Khánh Linh', username: 'linh.dalat', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', followers: '89K' },
  { id: 3, name: 'Chef Duy Anh', username: 'duyanh.cook', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', followers: '210K' },
  { id: 4, name: 'Bảo Ngọc', username: 'ngoc.golden', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', followers: '56K' },
]

export const TRENDING_HASHTAGS = [
  { tag: '#Hanoi', count: '12.4K' },
  { tag: '#Coffee', count: '8.9K' },
  { tag: '#DaLat', count: '24.1K' },
  { tag: '#Sunset', count: '15.7K' },
  { tag: '#Cooking', count: '9.3K' },
  { tag: '#Pets', count: '31.2K' },
]

export const INITIAL_COMMENTS = {
  'sample-video-1': [
    { id: 1, name: 'Hương Giang', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=giang', text: 'Nhìn Hà Nội bình yên quá bạn ơi! Góc quay màu phim đẹp xuất sắc ❤️' },
    { id: 2, name: 'Đức Huy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=huy', text: 'Màu video đẹp thật sự, bạn dùng app hay máy gì quay thế?' },
  ],
  'sample-video-2': [
    { id: 1, name: 'Thùy Dương', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duong', text: 'Mưa lạnh ngắm video này ấm áp hẳn ☕️' },
  ],
  'sample-video-3': [
    { id: 1, name: 'Tuấn Đạt', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dat', text: 'Đà Lạt luôn là chân ái của sự bình yên.' },
    { id: 2, name: 'Phan Vy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vy', text: 'Chỗ này ở khu vực nào Đà Lạt thế thớt?' },
  ],
}

export const TAB_ITEMS = [
  { key: 'for-you', label: 'Dành cho bạn', icon: BsLightningCharge },
  { key: 'trending', label: 'Xu hướng', icon: FiTrendingUp },
  { key: 'following', label: 'Đang theo dõi', icon: FaUserFriends },
  { key: 'relax', label: 'Thư giãn & Chill', icon: BsMusicNoteBeamed },
]
