export const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Quản lý người dùng' },
  { id: 'unbanRequests', label: 'Yêu cầu mở khóa' },
  { id: 'posts', label: 'Quản lý bài viết' },
  { id: 'comments', label: 'Quản lý bình luận' },
  { id: 'stats', label: 'Thống kê tài liệu' },
]

export const initialUsers = [
  {
    id: 'u1',
    fullName: 'Nguyễn Văn Nam',
    email: 'nam.nguyen@zivo.vn',
    role: 'member',
    status: 'active',
    lastActive: '06/04/2026 08:35',
  },
  {
    id: 'u2',
    fullName: 'Trần Thị Linh',
    email: 'linh.tran@zivo.vn',
    role: 'moderator',
    status: 'active',
    lastActive: '06/04/2026 08:10',
  },
  {
    id: 'u3',
    fullName: 'Phạm Hoàng Long',
    email: 'long.pham@zivo.vn',
    role: 'member',
    status: 'locked',
    lastActive: '05/04/2026 23:52',
  },
  {
    id: 'u4',
    fullName: 'Lê Minh Châu',
    email: 'chau.le@zivo.vn',
    role: 'member',
    status: 'active',
    lastActive: '06/04/2026 07:40',
  },
]

export const initialPosts = [
  {
    id: 'p1',
    author: 'Trần Thị Linh',
    content: 'Tổng hợp tài liệu hướng dẫn sử dụng hệ thống học trực tuyến.',
    status: 'approved',
    documentTitle: 'Hướng dẫn sử dụng LMS 2026',
    documentValid: true,
    createdAt: '05/04/2026',
  },
  {
    id: 'p2',
    author: 'Nguyễn Văn Nam',
    content: 'Chia sẻ file bài giảng đã cập nhật cho học kỳ mới.',
    status: 'pending',
    documentTitle: 'Bài giảng cơ sở dữ liệu nâng cao',
    documentValid: true,
    createdAt: '05/04/2026',
  },
  {
    id: 'p3',
    author: 'Lê Minh Châu',
    content: 'Tài liệu gốc chưa rõ nguồn, cần kiểm duyệt trước khi hiển thị.',
    status: 'rejected',
    documentTitle: 'Tài liệu tham khảo không rõ nguồn',
    documentValid: false,
    createdAt: '04/04/2026',
  },
]

export const initialComments = [
  {
    id: 'c1',
    postId: 'p1',
    author: 'Đỗ Quang Hưng',
    content: 'Tài liệu rất dễ hiểu, cảm ơn bạn đã chia sẻ.',
    createdAt: '06/04/2026 07:50',
  },
  {
    id: 'c2',
    postId: 'p2',
    author: 'Phạm Minh Khoa',
    content: 'Bạn có thể bổ sung thêm mục tài liệu tham khảo không?',
    createdAt: '06/04/2026 08:02',
  },
  {
    id: 'c3',
    postId: 'p3',
    author: 'Lê Thu Hà',
    content: 'Nội dung này có dấu hiệu sao chép, đề nghị admin xem lại.',
    createdAt: '06/04/2026 08:08',
  },
]

export const initialDocuments = [
  {
    id: 'd1',
    title: 'Hướng dẫn sử dụng LMS 2026',
    category: 'Hướng dẫn',
    views: 2840,
    isValid: true,
  },
  {
    id: 'd2',
    title: 'Bài giảng cơ sở dữ liệu nâng cao',
    category: 'Bài giảng',
    views: 2230,
    isValid: true,
  },
  {
    id: 'd3',
    title: 'Mẫu báo cáo đồ án chuyên ngành',
    category: 'Mẫu tài liệu',
    views: 1985,
    isValid: true,
  },
  {
    id: 'd4',
    title: 'Tài liệu tham khảo không rõ nguồn',
    category: 'Tài liệu chờ duyệt',
    views: 690,
    isValid: false,
  },
]
