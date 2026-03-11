/**
 * 🎨 SocialNet – Hệ thống màu sắc (Design Tokens)
 * ══════════════════════════════════════════════════════
 *
 * Palette thiết kế theo phong cách Chuyên nghiệp & Tin cậy (Facebook/LinkedIn)
 * Áp dụng quy tắc phối màu 60-30-10:
 *   • 60% – Nền (trắng, xám nhạt): Tạo không gian sạch sẽ, dễ đọc
 *   • 30% – Phụ trợ (xám đậm, border): Text, viền, thành phần phụ
 *   • 10% – Điểm nhấn (xanh dương): Nút CTA, link, active state
 *
 * ── Quy tắc sử dụng ──
 * 1. Chỉ dùng 5 nhóm màu: primary, accent, neutral (gray), error (red), success (emerald)
 * 2. Đảm bảo contrast ratio ≥ 4.5:1 cho text trên nền sáng
 * 3. Dùng shade 600 làm màu chính (CTA buttons, links)
 * 4. Dùng shade 50-100 cho background highlight
 * 5. Dùng shade 700 cho hover state
 *
 * ── Cách sử dụng trong Tailwind ──
 * bg-primary-600, text-primary-600, border-primary-500, ...
 * bg-accent-500,  text-accent-600,  ...
 */

// ═══════════════════════════════════════════════
// PRIMARY – Xanh dương chuyên nghiệp (10% – CTA)
// Gợi cảm giác tin cậy, chuyên nghiệp (Facebook/LinkedIn)
// ═══════════════════════════════════════════════
export const primary = {
  50:  '#F0F7FF',  // Background nhạt nhất (hover, active areas)
  100: '#DFEEFF',  // Background tinted nhẹ
  200: '#B8DCFF',  // Border nhạt, ring light
  300: '#8AC3FF',  // Focus ring, light accent
  400: '#54A3FF',  // Icon color, medium accent
  500: '#2B85F6',  // Interactive elements chính
  600: '#1877F2',  // ★ MÀU BRAND CHÍNH – CTA buttons, links
  700: '#1465D1',  // Hover state cho primary buttons
  800: '#1550A8',  // Dark variant (gradients)
  900: '#163E85',  // Very dark (gradient endpoint)
  950: '#0F2854',  // Darkest shade
}

// ═══════════════════════════════════════════════
// ACCENT – Cam san hô ấm áp (Năng lượng & Sáng tạo)
// Tạo điểm nhấn nổi bật cho CTA phụ, notification, badge
// ═══════════════════════════════════════════════
export const accent = {
  50:  '#FFF7ED',  // Background nhạt
  100: '#FFEDD5',  // Background tinted
  200: '#FED7AA',  // Border nhạt
  300: '#FDBA74',  // Light accent
  400: '#FB923C',  // Medium accent
  500: '#F97316',  // ★ Cam chính – Secondary CTA
  600: '#EA580C',  // Hover/Dark variant
  700: '#C2410C',  // Darker
  800: '#9A3412',  // Very dark
  900: '#7C2D12',  // Darkest
}

// ═══════════════════════════════════════════════
// NEUTRAL – Xám trung tính (60% nền + 30% phụ trợ)
// Sử dụng Tailwind gray mặc định – đã được tối ưu
// ═══════════════════════════════════════════════
export const neutral = {
  50:  '#F9FAFB',  // Page background (60%)
  100: '#F3F4F6',  // Card hover, alt background
  200: '#E5E7EB',  // Border nhạt, divider
  300: '#D1D5DB',  // Border rõ hơn
  400: '#9CA3AF',  // Placeholder text, icon mờ
  500: '#6B7280',  // Secondary text
  600: '#4B5563',  // Body text
  700: '#374151',  // Heading text nhỏ
  800: '#1F2937',  // Strong text
  900: '#111827',  // ★ Heading chính, title
  950: '#030712',  // Maximum contrast
}

// ═══════════════════════════════════════════════
// ERROR – Đỏ cảnh báo
// Validation errors, destructive actions, "unlike"
// ═══════════════════════════════════════════════
export const error = {
  50:  '#FEF2F2',  // Background lỗi
  100: '#FEE2E2',
  200: '#FECACA',  // Border lỗi
  400: '#F87171',  // Icon lỗi
  500: '#EF4444',  // ★ Like button (đỏ tim)
  600: '#DC2626',  // Text lỗi
}

// ═══════════════════════════════════════════════
// SUCCESS – Xanh lá thành công
// Trạng thái online, thông báo thành công
// ═══════════════════════════════════════════════
export const success = {
  50:  '#ECFDF5',
  500: '#10B981',  // ★ Online dot, success state
  600: '#059669',
}

// ═══════════════════════════════════════════════
// INFO – Xanh trời nhẹ (AI features)
// Badge AI Generated, thông tin phụ
// ═══════════════════════════════════════════════
export const info = {
  50:  '#F0F9FF',
  100: '#E0F2FE',
  500: '#0EA5E9',
  600: '#0284C7',  // ★ AI Generated badge text
}

// ═══════════════════════════════════════════════
// QUY TẮC 60-30-10 ÁP DỤNG
// ═══════════════════════════════════════════════
export const layout = {
  // 60% – Màu nền chính
  background: '#FFFFFF',       // bg-white
  backgroundAlt: '#F9FAFB',   // bg-gray-50 (neutral-50)

  // 30% – Màu phụ trợ (text, border, secondary elements)
  textPrimary: '#111827',      // text-gray-900
  textSecondary: '#6B7280',    // text-gray-500
  textTertiary: '#9CA3AF',     // text-gray-400
  border: '#F3F4F6',           // border-gray-100
  borderStrong: '#E5E7EB',     // border-gray-200

  // 10% – Màu điểm nhấn (CTA, brand, active)
  brandPrimary: '#1877F2',     // bg-primary-600
  brandHover: '#1465D1',       // bg-primary-700
  brandLight: '#F0F7FF',       // bg-primary-50
}

// ═══════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════
const colors = {
  primary,
  accent,
  neutral,
  error,
  success,
  info,
  layout,
}

export default colors
