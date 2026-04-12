/**
 * 🎨 Theme Colors – Professional & Trustworthy (Facebook/LinkedIn style)
 * ─────────────────────────────────────────────────────────────────────────
 * Bảng màu chính của toàn bộ project.
 * Tuân thủ quy tắc phối màu 60-30-10.
 *
 * Cách dùng trong JSX:
 *   - Tailwind class: className="bg-primary-600 text-white"
 *   - Logic JS:       import { COLORS } from '@/theme/colors'
 *
 * Quy tắc 60-30-10:
 *   60% – Nền (background, surface)
 *   30% – Text, border, secondary elements
 *   10% – Primary CTA (primary-600) + Accent (accent-500)
 */
export const COLORS = {
  primary: '#1877F2',       // Facebook Blue – Màu chủ đạo (Nút bấm, Link, CTA)
  primaryHover: '#1565D8',  // Primary đậm hơn khi hover
  primaryLight: '#E8F0FE',  // Primary rất nhạt (Background highlight)

  accent: '#F97316',        // Coral/Orange – Điểm nhấn nóng
  accentHover: '#EA580C',   // Accent đậm hơn khi hover

  background: '#F9FAFB',    // Gray 50 – Nền tổng thể (60%)
  surface: '#FFFFFF',       // Nền card / modal
  surfaceHover: '#F3F4F6',  // Hover trên card

  text: '#111827',          // Gray 900 – Chữ chính (30%)
  textSecondary: '#6B7280', // Gray 500 – Chữ phụ (mô tả, timestamp)
  textLight: '#9CA3AF',     // Gray 400 – Placeholder

  border: '#E5E7EB',        // Gray 200 – Viền
  borderFocus: '#1877F2',   // Viền khi focus (= primary)

  success: '#10B981',       // Emerald – Thành công
  error: '#EF4444',         // Red – Lỗi
  errorLight: '#FEE2E2',    // Nền nhẹ cho trạng thái lỗi
  warning: '#F59E0B',       // Amber – Cảnh báo
  info: '#3B82F6',          // Blue – Thông tin

  like: '#EF4444',          // Màu trái tim (Like)
  online: '#10B981',        // Trạng thái online

  // Admin palette
  adminSidebarBg: '#F3F6FB',
  adminSidebarText: '#334155',
  adminSidebarActive: '#1F3A60',
  adminSidebarActiveHover: '#17304F',
  adminPanelBg: '#FFFFFF',
  adminOverlay: 'rgba(15, 23, 42, 0.35)',
}

export default COLORS
