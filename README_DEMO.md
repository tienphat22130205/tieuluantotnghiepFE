# 🎭 Chế độ Demo - Xem UI không cần Backend

## Cách sử dụng

### 1. Chạy project
```bash
cd frontend
npm run dev
```

### 2. Truy cập trang Login
Mở trình duyệt tại `http://localhost:3000/login`

### 3. Nhấn nút "Xem Demo"
Bạn sẽ thấy nút màu xanh dương có icon ✨:
```
✨ Xem Demo (Không cần Backend)
```

### 4. Khám phá giao diện
Sau khi đăng nhập Demo, bạn có thể:
- ✅ Xem Newsfeed với 4 bài viết mẫu
- ✅ Xem trang Profile
- ✅ Xem chi tiết bài viết
- ✅ Thấy UI các nút Like, Comment, Save
- ⚠️ **Không thể** đăng bài mới (cần Backend + AI Service thật)
- ⚠️ **Không thể** Like/Comment thực tế (chỉ hiển thị UI)

---

## Thông tin Demo Account

Khi bấm "Xem Demo", hệ thống tự động đăng nhập với:
- **Tên:** Ngô Tiến Phát
- **Username:** tienphat
- **Email:** phat@example.com

---

## Dữ liệu mẫu (Mock Data)

### Bài viết mẫu:
1. **Hoàng hôn trên núi** (AI Generated - 2 giờ trước)
2. **Burger tự làm** (5 giờ trước)
3. **Hệ thống AI hoàn thành** (1 ngày trước)
4. **Code đến 3h sáng** (2 ngày trước)

### File chứa mock data:
📁 `src/utils/mockData.js`

---

## Hạn chế của Demo Mode

| Tính năng | Demo Mode | Backend Thật |
|-----------|-----------|--------------|
| Xem Newsfeed | ✅ | ✅ |
| Xem Profile | ✅ | ✅ |
| Xem chi tiết bài viết | ✅ | ✅ |
| Đăng bài mới | ❌ | ✅ |
| AI sinh caption | ❌ | ✅ |
| Like/Comment | ❌ (chỉ UI) | ✅ |
| Upload ảnh | ❌ | ✅ |
| Follow/Unfollow | ❌ | ✅ |

---

## Để có đầy đủ tính năng

Bạn cần có Backend chạy:
1. **Node.js Backend** (Express + MongoDB) - Port 5000
2. **Python AI Service** - Sinh caption từ ảnh
3. **MongoDB Database** - Lưu trữ dữ liệu

Hãy yêu cầu tạo Backend nếu muốn test đầy đủ các tính năng!

---

## Đăng xuất Demo Mode

Nhấn nút **Đăng xuất** ở góc trên bên phải → Quay về trang Login.

---

## Tech Stack sử dụng

- **Frontend:** React + Vite + Tailwind CSS v4
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v6
- **Icons:** React Icons
- **Mock Data:** Static JS objects

---

**Lưu ý:** Demo mode chỉ để xem giao diện. Mọi thay đổi (like, comment) sẽ **không được lưu** khi refresh trang.
