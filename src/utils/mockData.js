/**
 * Mock Data – Dữ liệu giả để test UI mà không cần Backend.
 * Chỉ dùng cho development/demo.
 */

// User giả lập
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'tienphat',
  email: 'phat@example.com',
  role: 'USER',
  full_name: 'Ngô Tiến Phát',
  avatar: 'https://i.pravatar.cc/150?img=33',
  bio: 'Sinh viên CNTT - Đam mê AI & Web Development',
  followers: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
  following: ['507f1f77bcf86cd799439014'],
  saved_posts: [],
  created_at: '2025-09-01T00:00:00Z',
  is_active: true,
}

export const mockAdminUser = {
  _id: '507f1f77bcf86cd799439099',
  username: 'admin',
  email: 'admin@example.com',
  role: 'ROLE_ADMIN',
  full_name: 'System Admin',
  avatar: 'https://i.pravatar.cc/150?img=13',
  bio: 'Quản trị viên hệ thống mạng xã hội',
  followers: [],
  following: [],
  saved_posts: [],
  created_at: '2025-09-01T00:00:00Z',
  is_active: true,
}

// Profile đầy đủ (cho trang Profile)
export const mockProfile = {
  _id: '507f1f77bcf86cd799439011',
  username: 'tienphat',
  email: 'phat@example.com',
  full_name: 'Ngô Tiến Phát',
  avatar: 'https://i.pravatar.cc/150?img=33',
  coverPhoto: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
  bio: '🎓 Sinh viên CNTT - Đam mê AI & Web Development\n💻 Fullstack Developer | React + Node.js\n🚀 Đang xây dựng mạng xã hội với AI',
  location: 'TP. Hồ Chí Minh, Việt Nam',
  website: 'https://tienphat.dev',
  followers: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013', '507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
  following: ['507f1f77bcf86cd799439014', '507f1f77bcf86cd799439017'],
  saved_posts: [],
  created_at: '2025-09-01T00:00:00Z',
  is_active: true,
}

// Token giả lập
export const mockToken = 'mock-jwt-token-demo-mode-12345'

// Danh sách bài viết mẫu
export const mockPosts = [
  {
    _id: '65a1b2c3d4e5f6789012345a',
    user: {
      _id: '507f1f77bcf86cd799439011',
      username: 'tienphat',
      full_name: 'Ngô Tiến Phát',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    caption: 'Hoàng hôn tuyệt đẹp trên núi - Được tạo bởi AI từ phân tích hình ảnh',
    hashtags: ['#sunset', '#mountain', '#nature', '#beautiful'],
    likes: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    comments_count: 5,
    is_ai_generated: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
  },
  {
    _id: '65a1b2c3d4e5f6789012345b',
    user: {
      _id: '507f1f77bcf86cd799439014',
      username: 'anhtuyet',
      full_name: 'Hoàng Anh Tuyết',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    image_url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800',
    caption: 'Burger tự làm cuối tuần 🍔 Ngon không cưỡng nổi!',
    hashtags: ['#homemade', '#burger', '#foodie', '#weekend'],
    likes: ['507f1f77bcf86cd799439011'],
    comments_count: 3,
    is_ai_generated: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '65a1b2c3d4e5f6789012345c',
    user: {
      _id: '507f1f77bcf86cd799439011',
      username: 'tienphat',
      full_name: 'Ngô Tiến Phát',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    image_url: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=800',
    caption: 'Hệ thống AI của mình vừa hoàn thành! Có thể tự động sinh caption cho ảnh rồi 🎉',
    hashtags: ['#AI', '#MachineLearning', '#WebDev', '#ReactJS'],
    likes: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    comments_count: 8,
    is_ai_generated: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '65a1b2c3d4e5f6789012345d',
    user: {
      _id: '507f1f77bcf86cd799439012',
      username: 'minhduc',
      full_name: 'Lê Minh Đức',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    image_url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800',
    caption: 'Code đến 3h sáng để fix bug 😅 Nhưng mà xong rồi nè!',
    hashtags: ['#coding', '#developer', '#debugging', '#nightshift'],
    likes: ['507f1f77bcf86cd799439011'],
    comments_count: 12,
    is_ai_generated: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Bạn bè mẫu (Facebook-style: avatar lớn, tên, bạn chung)
export const mockFriends = [
  {
    _id: '507f1f77bcf86cd799439012',
    full_name: 'Lê Minh Đức',
    username: 'minhduc',
    avatar: 'https://i.pravatar.cc/150?img=12',
    mutualFriends: 5,
  },
  {
    _id: '507f1f77bcf86cd799439013',
    full_name: 'Trần Thuỳ Linh',
    username: 'thuylinh',
    avatar: 'https://i.pravatar.cc/150?img=5',
    mutualFriends: 3,
  },
  {
    _id: '507f1f77bcf86cd799439014',
    full_name: 'Hoàng Anh Tuyết',
    username: 'anhtuyet',
    avatar: 'https://i.pravatar.cc/150?img=10',
    mutualFriends: 8,
  },
  {
    _id: '507f1f77bcf86cd799439015',
    full_name: 'Phạm Quốc Bảo',
    username: 'quocbao',
    avatar: 'https://i.pravatar.cc/150?img=15',
    mutualFriends: 2,
  },
  {
    _id: '507f1f77bcf86cd799439016',
    full_name: 'Nguyễn Thanh Hà',
    username: 'thanhha',
    avatar: 'https://i.pravatar.cc/150?img=25',
    mutualFriends: 0,
  },
  {
    _id: '507f1f77bcf86cd799439017',
    full_name: 'Võ Đình Khoa',
    username: 'dinhkhoa',
    avatar: 'https://i.pravatar.cc/150?img=52',
    mutualFriends: 4,
  },
  {
    _id: '507f1f77bcf86cd799439018',
    full_name: 'Đặng Minh Tâm',
    username: 'minhtam',
    avatar: 'https://i.pravatar.cc/150?img=60',
    mutualFriends: 1,
  },
  {
    _id: '507f1f77bcf86cd799439019',
    full_name: 'Bùi Hồng Nhung',
    username: 'hongnhung',
    avatar: 'https://i.pravatar.cc/150?img=44',
    mutualFriends: 6,
  },
]

// Comments mẫu
export const mockComments = {
  '65a1b2c3d4e5f6789012345a': [
    {
      _id: 'cmt1',
      user: {
        _id: '507f1f77bcf86cd799439012',
        username: 'minhduc',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      content: 'Ảnh đẹp quá bạn ơi! Chụp ở đâu vậy?',
      created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'cmt2',
      user: mockUser,
      content: 'Cảm ơn bạn! Mình chụp ở Đà Lạt đó 🏔️',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
}
