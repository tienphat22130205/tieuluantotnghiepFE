# SocialNet Frontend – Tài liệu cấu trúc dự án

> **Cập nhật lần cuối:** 02/03/2026
> **Trạng thái:** Chỉ Frontend (chưa có Backend)
> **Kiến trúc:** Feature-Based Architecture

---

## 1. Tổng quan

**SocialNet** là ứng dụng mạng xã hội tích hợp AI. Hiện tại project **chỉ xây dựng giao diện Frontend**, chưa kết nối Backend.

**Các tính năng giao diện đã hoàn thành:**
- Giao diện Đăng ký / Đăng nhập (có Demo Mode – không cần Backend)
- Trang Newsfeed hiển thị danh sách bài viết
- Trang tạo bài viết mới + giao diện nút gọi AI sinh caption
- Trang chi tiết bài viết + giao diện bình luận
- Trang cá nhân (Profile) + giao diện Follow
- Thanh điều hướng responsive (Desktop + Mobile)
- Like, Bookmark, Share (giao diện nút bấm)
- Demo Mode: xem UI với dữ liệu mẫu, không cần Backend

> ⚠️ **Lưu ý:** Tất cả API call (đăng nhập thật, đăng bài, like, comment...) đều cần Backend mới hoạt động. Hiện tại chỉ có Demo Mode dùng mockData để xem giao diện.

---

## 2. Công nghệ sử dụng

| Thành phần          | Công nghệ                        | Phiên bản   | Ghi chú                              |
|---------------------|----------------------------------|-------------|---------------------------------------|
| Build Tool          | Vite                             | ^7.2.4      | Dev server port 3000                  |
| UI Library          | React                            | ^19.2.0     | JavaScript (JSX), không dùng TypeScript |
| Routing             | React Router DOM                 | ^7.13.0     | Route guards: Protected & Guest      |
| State Management    | Redux Toolkit + React-Redux      | ^2.11.2     | Quản lý auth & posts state           |
| HTTP Client         | Axios                            | ^1.13.5     | Interceptors auto gắn token, xử lý 401 |
| CSS Framework       | Tailwind CSS v4 (Vite plugin)    | ^4.1.18     | Utility-first CSS                     |
| Icon Library        | React Icons                      | ^5.5.0      | Ai, Hi, Bs icon packs                |
| Linting             | ESLint                           | ^9.39.1     | Flat config                           |
| Path Alias          | `@/` → `src/`                    | —           | jsconfig.json + vite.config.js        |

---

## 3. Cấu trúc thư mục chi tiết

```
frontend/
│
├── index.html                    # HTML gốc – Vite inject JS/CSS vào đây
├── package.json                  # Dependencies, scripts (dev/build/lint)
├── vite.config.js                # Cấu hình Vite: plugins, alias @/, proxy /api
├── eslint.config.js              # Cấu hình ESLint (flat config ES module)
├── jsconfig.json                 # Path alias cho Editor intellisense (@/ → src/)
│
├── github/                       # 📚 Tài liệu dự án
│   └── PROJECT_STRUCTURE.md      #   File này – cập nhật mỗi khi có thay đổi
│
├── public/                       # Static files (favicon, ảnh không import trong code)
│
└── src/                          # ── SOURCE CODE CHÍNH ──
    │
    ├── main.jsx                  # Entry point: render <App> + Redux <Provider>
    ├── App.jsx                   # Router gốc: định nghĩa Routes + Route Guards
    ├── index.css                 # Global CSS: import Tailwind + custom styles
    ├── assets/                   # Ảnh, font dùng trong code (import trực tiếp)
    │
    │── ─── INFRASTRUCTURE ───────────────────────────────────────────
    │
    ├── config/                   # ⚙️ Cấu hình ứng dụng
    │   └── index.js              #   APP_CONFIG: tên app, API URL, timeout,
    │                             #   max image size, posts per page, min password
    │
    ├── constants/                # 📋 Hằng số dùng chung
    │   └── index.js              #   ROUTES: các đường dẫn (/login, /register...)
    │                             #   QUERY_KEYS: key cho caching (nếu dùng sau này)
    │
    ├── theme/                    # 🎨 Bảng màu & giao diện
    │   └── colors.js             #   COLORS: primary, secondary, background,
    │                             #   surface, text, border, success, error...
    │
    ├── types/                    # 📝 JSDoc Type Definitions
    │   └── index.js              #   Định nghĩa kiểu: User, Post, Comment,
    │                             #   AuthState, PostState (dùng cho intellisense)
    │
    │── ─── SHARED (dùng chung) ──────────────────────────────────────
    │
    ├── components/ui/            # 🧩 Reusable UI Components (dùng chung toàn app)
    │   ├── Avatar.jsx            #   Hình đại diện: hiển thị ảnh hoặc chữ cái đầu,
    │   │                         #   hỗ trợ link (click → profile), chấm online,
    │   │                         #   các size: sm/md/lg/xl
    │   ├── Button.jsx            #   Nút bấm đa năng: variants (primary/secondary/
    │   │                         #   outline/danger/ghost), sizes, loading state,
    │   │                         #   fullWidth, disabled
    │   ├── Input.jsx             #   Ô nhập liệu: hỗ trợ label, icon bên trái,
    │   │                         #   hiện/ẩn mật khẩu (toggle eye icon), error state
    │   ├── LoadingSpinner.jsx    #   Spinner loading: animation xoay + text tùy chỉnh,
    │   │                         #   dùng khi chờ API hoặc chuyển trang
    │   └── index.js              #   Barrel export: import { Avatar, Button } from
    │                             #   '@/components/ui' (1 dòng import gọn)
    │
    ├── services/                 # 🌐 Shared API Layer
    │   └── api.js                #   Axios instance dùng chung:
    │                             #   - baseURL: /api
    │                             #   - Request interceptor: auto gắn Bearer token
    │                             #   - Response interceptor: unwrap data, xử lý 401
    │                             #     (xóa token + redirect /login)
    │
    ├── store/                    # 🗄️ Redux Store gốc
    │   └── index.js              #   configureStore: gom authReducer + postReducer
    │                             #   từ các feature modules
    │
    ├── hooks/                    # 🪝 Shared Custom Hooks (placeholder)
    │   └── index.js              #   Barrel export cho hooks dùng chung sau này
    │
    ├── utils/                    # 🔧 Hàm tiện ích
    │   ├── formatDate.js         #   formatDate(): dd/mm/yyyy
    │   │                         #   timeAgo(): "vừa xong", "5 phút trước"...
    │   └── mockData.js           #   Dữ liệu giả cho Demo Mode:
    │                             #   mockUser, mockToken, mockPosts (2 bài mẫu)
    │
    │── ─── FEATURES (theo tính năng) ────────────────────────────────
    │
    ├── features/                 # 🏗️ Feature Modules (kiến trúc chính)
    │   │
    │   ├── auth/                 # 🔐 FEATURE: Xác thực (Authentication)
    │   │   ├── services/
    │   │   │   └── authService.js    # API: register, login, getMe, updateProfile,
    │   │   │                         # changePassword, uploadAvatar
    │   │   ├── store/
    │   │   │   └── authSlice.js      # Redux: state (user, token, isLoading, error)
    │   │   │                         # Thunks: register, login, getMe
    │   │   │                         # Reducers: logout, clearError, loginDemo
    │   │   ├── hooks/
    │   │   │   └── useAuth.js        # Hook: handleLogin, handleRegister,
    │   │   │                         # handleLogout, isAuthenticated – tách logic
    │   │   │                         # auth ra khỏi component cho clean code
    │   │   ├── pages/
    │   │   │   ├── LoginPage.jsx     # UI đăng nhập: form email + password,
    │   │   │   │                     # nút "Xem Demo" để vào Demo Mode,
    │   │   │   │                     # link sang trang đăng ký
    │   │   │   └── RegisterPage.jsx  # UI đăng ký: form họ tên + email +
    │   │   │                         # password + confirm password, validate
    │   │   │                         # client-side (min 6 ký tự, khớp password)
    │   │   └── index.js              # Barrel: export LoginPage, RegisterPage,
    │   │                             # useAuth, authService, authReducer, actions
    │   │
    │   ├── post/                 # 📝 FEATURE: Bài viết (Posts)
    │   │   ├── services/
    │   │   │   └── postService.js    # API: getFeed, getById, getByUser, create,
    │   │   │                         # update, delete, toggleLike, getComments,
    │   │   │                         # addComment, deleteComment, generateCaption
    │   │   │                         # (AI), toggleSave, getSaved
    │   │   ├── store/
    │   │   │   └── postSlice.js      # Redux: state (posts[], currentPost, page,
    │   │   │                         # hasMore, isLoading, error)
    │   │   │                         # Thunks: fetchFeed, createPost, toggleLike,
    │   │   │                         # addComment
    │   │   │                         # Reducers: clearPosts, setCurrentPost,
    │   │   │                         # loadMockPosts (demo mode)
    │   │   ├── components/
    │   │   │   └── PostCard.jsx      # Card bài viết: hiển thị avatar + tên +
    │   │   │                         # thời gian, ảnh, nút Like (toggle đỏ),
    │   │   │                         # Comment count, Share, Bookmark,
    │   │   │                         # Caption + Hashtags, AI badge
    │   │   ├── pages/
    │   │   │   ├── HomePage.jsx      # Trang chủ Newsfeed: sidebar profile nhanh
    │   │   │   │                     # (desktop), banner Demo Mode, danh sách
    │   │   │   │                     # PostCard, nút Load More, empty state
    │   │   │   ├── CreatePostPage.jsx # Tạo bài viết: upload ảnh (drag & drop UI),
    │   │   │   │                     # preview, nút AI sinh caption + hashtag,
    │   │   │   │                     # form nhập caption/hashtags, validate file
    │   │   │   │                     # (JPG/PNG/WebP, max 5MB)
    │   │   │   └── PostDetailPage.jsx # Chi tiết bài viết: ảnh lớn, like, caption,
    │   │   │                         # hashtags, danh sách comments, form nhập
    │   │   │                         # comment mới, nút quay lại
    │   │   └── index.js              # Barrel: export HomePage, CreatePostPage,
    │   │                             # PostDetailPage, PostCard, postService,
    │   │                             # postReducer, actions
    │   │
    │   └── user/                 # 👤 FEATURE: Người dùng (Users)
    │       ├── services/
    │       │   └── userService.js    # API: search, getProfile, toggleFollow,
    │       │                         # getFollowers, getFollowing, getSuggestions
    │       ├── pages/
    │       │   └── ProfilePage.jsx   # 🎨 Trang cá nhân (Facebook-style):
    │       │                         # - Cover photo lớn (editable, hover camera icon)
    │       │                         # - Avatar với ring border + camera icon hover
    │       │                         # - Name, username, stats (posts/followers/following)
    │       │                         # - Action buttons: Edit Profile / Follow + Message
    │       │                         # - Tab navigation: Posts, About, Photos, Friends
    │       │                         # - 2-column layout (desktop): Left sidebar (Intro,
    │       │                         #   Photos preview, Friends preview) + Right (Tab content)
    │       │                         # - Responsive: single column mobile, full-width cover
    │       └── index.js              # Barrel: export ProfilePage, userService
    │
    │── ─── LAYOUTS ──────────────────────────────────────────────────
    │
    └── layouts/                  # 📐 Layout Wrappers
        ├── AuthLayout.jsx        #   Layout cho trang Login/Register:
        │                         #   - Chia 2 cột (desktop): trái = banner giới thiệu,
        │                         #     phải = form đăng nhập/đăng ký
        │                         #   - Mobile: chỉ hiện form
        │                         #   - Dùng <Outlet> render page con
        ├── MainLayout.jsx        #   Layout cho trang đã đăng nhập:
        │                         #   - Navbar fixed trên cùng
        │                         #   - Content area có max-width + padding
        │                         #   - Dùng <Outlet> render page con
        └── components/
            └── Navbar.jsx        #   Thanh điều hướng chính:
                                  #   - Desktop: Logo + nav links + user menu + logout
                                  #   - Mobile: Top bar (logo + avatar), Bottom Navigation
                                  #     Bar cố định dưới màn hình như Facebook/Instagram,
                                  #     5 icons (Home, Search, Create, Notifications, Profile)
                                  #     với active state rõ ràng, nút Create nổi bật gradient
                                  #   - UX tối ưu cho mobile: dễ thao tác một tay
```

---

## 4. Giải thích kiến trúc Feature-Based

### Tại sao dùng kiến trúc này?

Thay vì để tất cả components, services, store... vào các folder chung (khó quản lý khi project lớn), ta nhóm theo **tính năng**:

```
❌ Cấu trúc cũ (flat):              ✅ Cấu trúc mới (feature-based):
src/                                src/features/
├── components/PostCard.jsx         ├── post/
├── pages/Home/HomePage.jsx         │   ├── components/PostCard.jsx
├── services/postService.js         │   ├── pages/HomePage.jsx
├── store/postSlice.js              │   ├── services/postService.js
                                    │   ├── store/postSlice.js
                                    │   └── index.js
```

**Lợi ích:**
- Mở 1 folder là thấy toàn bộ code liên quan đến tính năng đó
- Dễ thêm/xóa tính năng mà không ảnh hưởng phần khác
- Import gọn gàng nhờ barrel export: `import { HomePage } from '@/features/post'`
- Phù hợp khi project scale lên (thêm tính năng chat, notification...)

### Path Alias `@/`

Thay vì viết import dài dòng:
```js
import PostCard from '../../../components/PostCard'     // ❌ Khó đọc
```
Dùng alias:
```js
import { PostCard } from '@/features/post'              // ✅ Rõ ràng
import { Avatar, Button } from '@/components/ui'        // ✅ Gọn gàng
```

Cấu hình tại 2 file:
- `vite.config.js` → để Vite hiểu khi build
- `jsconfig.json` → để VS Code hiểu khi code (autocomplete, go to definition)

---

## 5. Luồng hoạt động (Data Flow)

### 5.1 Luồng xác thực

```
User mở app
    │
    ├── Có token trong localStorage?
    │   ├── CÓ → ProtectedRoute cho phép → vào MainLayout → HomePage
    │   └── KHÔNG → redirect → /login → AuthLayout → LoginPage
    │
LoginPage
    ├── Nhấn "Đăng nhập" → dispatch(login()) → authSlice thunk
    │       → authService.login() → API (cần Backend)
    │       → Lưu token + user vào Redux + localStorage
    │
    └── Nhấn "Xem Demo" → dispatch(loginDemo())
            → Dùng mockUser + mockToken (không cần Backend)
            → Navigate → HomePage
```

### 5.2 Luồng Newsfeed (Demo Mode)

```
HomePage mount
    │
    ├── Kiểm tra isDemoMode (token === mockToken)
    │
    ├── Demo Mode → dispatch(loadMockPosts(mockPosts))
    │               → Hiển thị 2 bài viết mẫu từ mockData
    │               → Banner "Chế độ Demo" hiển thị
    │
    └── Real Mode → dispatch(fetchFeed()) → postSlice thunk
                    → postService.getFeed() → API (cần Backend)
                    → Cập nhật posts[] → Render PostCard
```

### 5.3 Luồng AI Caption (giao diện – cần Backend)

```
CreatePostPage
    │
    ├── User chọn ảnh → Validate (JPG/PNG/WebP, ≤5MB) → Preview
    │
    ├── Nhấn "✨ AI Sinh nội dung"
    │       → postService.generateCaption(formData)
    │       → API /ai/generate-caption (CẦN BACKEND)
    │       → Response { caption, hashtags } → Auto-fill form
    │
    └── Nhấn "Đăng bài"
            → dispatch(createPost(formData))
            → API /posts (CẦN BACKEND)
            → Navigate → HomePage
```

---

## 6. Routing

| Path               | Component        | Guard         | Giao diện                         |
|--------------------|------------------|---------------|-----------------------------------|
| `/login`           | LoginPage        | GuestRoute    | Form đăng nhập + nút Demo        |
| `/register`        | RegisterPage     | GuestRoute    | Form đăng ký 4 trường            |
| `/`                | HomePage         | ProtectedRoute | Newsfeed + sidebar profile       |
| `/create`          | CreatePostPage   | ProtectedRoute | Upload ảnh + AI + form caption   |
| `/profile/:userId` | ProfilePage      | ProtectedRoute | Profile header + danh sách bài   |
| `/post/:postId`    | PostDetailPage   | ProtectedRoute | Bài viết chi tiết + comments     |
| `*`                | 404 Page         | —             | "Trang không tồn tại"            |

**Route Guards:**
- `ProtectedRoute`: chưa đăng nhập → redirect `/login`
- `GuestRoute`: đã đăng nhập → redirect `/`

---

## 7. API Endpoints (Backend cần cung cấp)

> Tất cả endpoint prefix `/api`. Vite proxy `/api` → `http://localhost:5000`.
> Hiện tại **chưa có Backend**, các endpoint dưới đây là giao diện FE đã chuẩn bị sẵn.

### Auth (`/api/auth/`)
| Method | Endpoint               | Mô tả                     | FE đã chuẩn bị? |
|--------|------------------------|----------------------------|:----------------:|
| POST   | `/auth/register`       | Đăng ký tài khoản          | ✅               |
| POST   | `/auth/login`          | Đăng nhập → {token, user}  | ✅               |
| GET    | `/auth/me`             | Lấy user hiện tại          | ✅               |
| PUT    | `/auth/profile`        | Cập nhật thông tin          | ✅ (service)     |
| PUT    | `/auth/change-password` | Đổi mật khẩu              | ✅ (service)     |
| POST   | `/auth/avatar`         | Upload avatar              | ✅ (service)     |

### Posts (`/api/posts/`)
| Method | Endpoint                         | Mô tả                  | FE đã chuẩn bị? |
|--------|----------------------------------|-------------------------|:----------------:|
| GET    | `/posts/feed?page=&limit=`       | Newsfeed (phân trang)   | ✅               |
| GET    | `/posts/:postId`                 | Chi tiết bài viết       | ✅               |
| GET    | `/posts/user/:userId?page=`      | Bài viết theo user      | ✅               |
| POST   | `/posts`                         | Tạo bài viết (FormData) | ✅               |
| PUT    | `/posts/:postId`                 | Sửa bài viết            | ✅ (service)     |
| DELETE | `/posts/:postId`                 | Xóa bài viết            | ✅ (service)     |
| PUT    | `/posts/:postId/like`            | Toggle Like             | ✅               |
| GET    | `/posts/:postId/comments`        | Lấy comments            | ✅               |
| POST   | `/posts/:postId/comments`        | Thêm comment            | ✅               |
| DELETE | `/posts/:postId/comments/:cId`   | Xóa comment             | ✅ (service)     |
| PUT    | `/posts/:postId/save`            | Toggle Bookmark         | ✅ (service)     |
| GET    | `/posts/saved`                   | Bài viết đã lưu         | ✅ (service)     |

### Users (`/api/users/`)
| Method | Endpoint                    | Mô tả              | FE đã chuẩn bị? |
|--------|-----------------------------|---------------------|:----------------:|
| GET    | `/users/search?q=`          | Tìm kiếm user      | ✅ (service)     |
| GET    | `/users/:userId`            | Profile user        | ✅               |
| PUT    | `/users/:userId/follow`     | Toggle Follow       | ✅               |
| GET    | `/users/:userId/followers`  | Danh sách followers | ✅ (service)     |
| GET    | `/users/:userId/following`  | Danh sách following | ✅ (service)     |
| GET    | `/users/suggestions`        | Gợi ý bạn bè       | ✅ (service)     |

### AI (`/api/ai/`)
| Method | Endpoint                | Mô tả                      | FE đã chuẩn bị? |
|--------|-------------------------|-----------------------------|:----------------:|
| POST   | `/ai/generate-caption`  | AI sinh caption + hashtag   | ✅               |

> **Ghi chú:**
> - ✅ = FE có giao diện + service + xử lý response
> - ✅ (service) = FE có service function nhưng chưa có trang gọi trực tiếp

---

## 8. Demo Mode

Cho phép xem giao diện **mà không cần Backend**:

1. Mở app → Trang Login
2. Nhấn nút **"✨ Xem Demo (Không cần Backend)"**
3. Hệ thống dùng `mockUser` + `mockToken` từ [utils/mockData.js](../src/utils/mockData.js)
4. Vào HomePage → hiển thị 2 bài viết mẫu (`mockPosts`)
5. Banner vàng "Chế độ Demo" hiển thị ở đầu trang

**Hạn chế Demo Mode:** Like, comment, đăng bài... không lưu thực tế (chỉ là giao diện).

---

## 9. Scripts

```bash
npm run dev       # Chạy dev server tại http://localhost:3000
npm run build     # Build production → thư mục dist/
npm run lint      # Kiểm tra lỗi ESLint
npm run preview   # Xem thử bản build production
```

---

## 10. Changelog

| Ngày       | Thay đổi                                                                      |
|------------|-------------------------------------------------------------------------------|
| 02/03/2026 | **Profile Page Static Mode (Demo)**                                          |
|            | - Thêm `mockProfile` vào mockData.js (location, website, coverPhoto)         |
|            | - ProfilePage sử dụng mock data thay vì fetch API                            |
|            | - Loại bỏ các API calls (userService, postService)                           |
|            | - Thêm Demo banner ở đầu trang (amber background)                            |
|            | - Follow/Unfollow chỉ update UI (không call backend)                        |
|            | - Filter mockPosts để hiển thị posts của user                               |
| 02/03/2026 | **Profile Page Redesign - Facebook Style**                                   |
|            | - Cover photo lớn (h-64/80/96 responsive) với gradient mặc định              |
|            | - Hover camera icon để edit cover & avatar (chỉ own profile)                 |
|            | - Avatar XL với ring-4 ring-white, positioned over cover (-mt-16/20)         |
|            | - Stats inline dưới tên (Posts/Followers/Following clickable)                |
|            | - Action buttons: Edit Profile / Follow + Message + More (3-dot)             |
|            | - Tab navigation: Posts / About / Photos / Friends (scroll horizontal mobile)|
|            | - 2-column layout desktop: Sidebar (Intro, Photos, Friends) + Main content   |
|            | - Intro card: bio, location, website, join date với icons                    |
|            | - Photos grid 3x3, Friends grid 3x2 với "Xem tất cả" links                   |
|            | - Avatar component: Thêm `className` prop để hỗ trợ ring/shadow customs      |
| 02/03/2026 | **Mobile Navigation Redesign**                                                |
|            | - Thay hamburger menu → Bottom Navigation Bar (Facebook/Instagram pattern)  |
|            | - 5 tabs: Home, Search, Create, Notifications, Profile                       |
|            | - Active states: filled icons + indigo-600 color                             |
|            | - Create button: gradient background (standout center button)                |
|            | - Profile tab: avatar với ring border khi active                             |
|            | - MainLayout: thêm `pb-20` mobile để tránh bottom nav overlap                |
| 02/03/2026 | Tái cấu trúc toàn bộ sang Feature-Based Architecture                         |
|            | - Tạo `features/auth/`, `features/post/`, `features/user/`                   |
|            | - Tạo `components/ui/` (shared UI với barrel export)                          |
|            | - Thêm `config/`, `theme/`, `types/`, `constants/` (infrastructure)           |
|            | - Thêm path alias `@/` → `src/` (vite.config.js + jsconfig.json)             |
|            | - Di chuyển Navbar vào `layouts/components/`                                  |
|            | - Cập nhật tất cả import paths sang `@/` alias                               |
|            | - Xóa toàn bộ file cũ (pages/, components/*.jsx, services/auth+post+user...) |
|            | - Build + Lint pass: 0 errors                                                |
