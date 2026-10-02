import { BsLightningCharge, BsMusicNoteBeamed } from 'react-icons/bs'
import { FaUserFriends } from 'react-icons/fa'
import { FiTrendingUp } from 'react-icons/fi'

export const FALLBACK_VIDEOS = [
  {
    id: 'sample-video-1',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/sea_turtle.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/sea_turtle.jpg',
    title: 'Khám phá đại dương bao la: Chú rùa biển bơi lội giữa rạn san hô kỳ thú 🐢🌊 #ocean #nature #travel',
    user: { name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=nam', username: 'nam.ocean' },
    likes: 2150, commentsCount: 94, shares: 48,
    tag: 'travel',
  },
  {
    id: 'sample-video-2',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/wave.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/wave.jpg',
    title: 'Sóng biển vỗ bờ rì rào ngày nắng đẹp 🌅 Sạc lại năng lượng cho tâm hồn sau tuần bận rộn. #sunset #beachlife #chill',
    user: { name: 'Khánh Linh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', username: 'linh.dalat' },
    likes: 3420, commentsCount: 162, shares: 89,
    tag: 'sunset',
  },
  {
    id: 'sample-video-3',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/rafting.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/rafting.jpg',
    title: 'Chinh phục dòng sông dữ! Trải nghiệm chèo thuyền vượt thác siêu thót tim cùng hội bạn 🚣‍♂️🌲 #travel #adventure #rafting',
    user: { name: 'Thanh Tùng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', username: 'thanhtung.travel' },
    likes: 1890, commentsCount: 88, shares: 52,
    tag: 'travel',
  },
  {
    id: 'sample-video-4',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/elephants.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/elephants.jpg',
    title: 'Đàn voi sải bước bình yên giữa thảo nguyên hoang dã bao la 🐘🌿 #nature #wildlife #safari',
    user: { name: 'Bảo Ngọc', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', username: 'ngoc.golden' },
    likes: 2740, commentsCount: 120, shares: 64,
    tag: 'nature',
  },
  {
    id: 'sample-video-5',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/snow_horses.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/snow_horses.jpg',
    title: 'Đàn ngựa dũng mãnh phi nước đại giữa cánh đồng tuyết trắng xóa hùng vĩ 🐴❄️ #nature #winter #horses',
    user: { name: 'Tuấn Đạt', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dat', username: 'dat.adventure' },
    likes: 4120, commentsCount: 310, shares: 145,
    tag: 'nature',
  },
  {
    id: 'sample-video-6',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/dog.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/dog.jpg',
    title: 'Cún cưng tràn đầy năng lượng chạy nhảy bắt bóng giữa công viên ngày nắng 🐶🌸 #pets #doglover #cute',
    user: { name: 'Minh Thư', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thu', username: 'thu.coffee' },
    likes: 3880, commentsCount: 245, shares: 110,
    tag: 'pets',
  },
  {
    id: 'sample-video-7',
    link: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/kitten_fighting.mp4',
    poster: 'https://res.cloudinary.com/demo/video/upload/c_scale,w_720/kitten_fighting.jpg',
    title: 'Hai "chiến thần" mèo con so tài võ nghệ siêu đáng yêu khiến cả nhà bật cười 🐱🐾 #pets #catlover #cute',
    user: { name: 'Chef Duy Anh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', username: 'duyanh.cook' },
    likes: 5120, commentsCount: 420, shares: 230,
    tag: 'pets',
  },
]

export const FEATURED_CREATORS = [
  { id: 1, name: 'Thanh Tùng', username: 'thanhtung.travel', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', followers: '124K' },
  { id: 2, name: 'Khánh Linh', username: 'linh.dalat', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', followers: '89K' },
  { id: 3, name: 'Chef Duy Anh', username: 'duyanh.cook', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', followers: '210K' },
  { id: 4, name: 'Bảo Ngọc', username: 'ngoc.golden', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', followers: '56K' },
]

export const TRENDING_HASHTAGS = [
  { tag: '#Travel', count: '24.1K' },
  { tag: '#Nature', count: '31.2K' },
  { tag: '#Sunset', count: '15.7K' },
  { tag: '#Pets', count: '18.9K' },
]

export const INITIAL_COMMENTS = {
  'sample-video-1': [
    { id: 1, name: 'Hương Giang', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=giang', text: 'Nước biển trong xanh thấy cả đáy luôn, nhìn rùa bơi mê quá bạn ơi! 🐢🌊' },
    { id: 2, name: 'Đức Huy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=huy', text: 'Chỗ này lặn ở đảo nào thế bạn? Mình cũng muốn đi lặn hè này.' },
  ],
  'sample-video-2': [
    { id: 1, name: 'Thùy Dương', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duong', text: 'Hoàng hôn biển đẹp nao lòng, nghe tiếng sóng mà thấy nhẹ đầu hẳn 🌅' },
  ],
  'sample-video-3': [
    { id: 1, name: 'Tuấn Đạt', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dat', text: 'Nhìn thót tim nhưng kích thích thật sự! Nhất định phải rủ hội bạn trải nghiệm.' },
    { id: 2, name: 'Phan Vy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vy', text: 'Đoạn nước xoáy nhìn ngầu ghê á bạn!' },
  ],
  'sample-video-4': [
    { id: 1, name: 'Hoàng Long', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=long', text: 'Bình yên quá, thiên nhiên hoang dã luôn có một vẻ đẹp rất thiêng liêng.' },
  ],
  'sample-video-5': [
    { id: 1, name: 'Thanh Hằng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=hang', text: 'Đàn ngựa phi tuyết nhìn như cảnh trong phim điện ảnh luôn ấy 😍' },
  ],
  'sample-video-6': [
    { id: 1, name: 'Ngọc Mai', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mai', text: 'Nhìn mặt chú cún hớn hở chạy nhảy cưng xỉu luôn 🐶' },
  ],
  'sample-video-7': [
    { id: 1, name: 'Bảo Trâm', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tram', text: 'Hai "chiến thần" mèo bé tí mà đấu nhau căng thẳng quá haha! ❤️' },
  ],
}

export const TAB_ITEMS = [
  { key: 'for-you', label: 'Dành cho bạn', icon: BsLightningCharge },
  { key: 'trending', label: 'Xu hướng', icon: FiTrendingUp },
  { key: 'following', label: 'Đang theo dõi', icon: FaUserFriends },
  { key: 'relax', label: 'Thư giãn & Chill', icon: BsMusicNoteBeamed },
]
