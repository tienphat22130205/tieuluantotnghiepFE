/**
 * 📦 Type Definitions (JSDoc)
 * ────────────────────────────
 * Định nghĩa kiểu dữ liệu bằng JSDoc để editor hỗ trợ IntelliSense.
 * Khi migrate sang TypeScript, chuyển thành .ts interface.
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} full_name
 * @property {string} [avatar]
 * @property {string} [bio]
 * @property {string[]} followers
 * @property {string[]} following
 * @property {string[]} saved_posts
 * @property {string} created_at
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} Post
 * @property {string} _id
 * @property {User|{_id: string, username: string, full_name: string, avatar?: string}} user
 * @property {string} [image_url]
 * @property {string} [caption]
 * @property {string[]} [hashtags]
 * @property {string[]} likes
 * @property {number} comments_count
 * @property {boolean} [is_ai_generated]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Comment
 * @property {string} _id
 * @property {{_id: string, username: string, avatar?: string}} user
 * @property {string} content
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} PostState
 * @property {Post[]} posts
 * @property {Post|null} currentPost
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {number} page
 * @property {boolean} hasMore
 */

export {}
