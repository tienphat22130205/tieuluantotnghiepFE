/**
 * ⚙️ App Configuration
 * ─────────────────────
 * Tập trung các hằng số cấu hình toàn project.
 * Dễ thay đổi khi deploy lên các môi trường khác nhau.
 */

export const APP_CONFIG = {
  // ── App Info ──
  APP_NAME: 'Zivo',
  APP_DESCRIPTION: 'Mạng xã hội tích hợp AI',
  APP_VERSION: '1.0.0',

  // ── API ──
  API_BASE_URL: '/api',
  API_TIMEOUT: 15000,

  // ── Upload ──
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // ── Pagination ──
  POSTS_PER_PAGE: 10,

  // ── Validation ──
  MIN_PASSWORD_LENGTH: 6,
}

export default APP_CONFIG
