import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
if (!getApps().length) {
  if (firebaseConfig.apiKey) {
    try {
      app = initializeApp(firebaseConfig)
    } catch (err) {
      console.error('Failed to initialize Firebase App:', err)
    }
  } else {
    console.warn('⚠️ VITE_FIREBASE_API_KEY is missing in frontend environment variables.')
  }
} else {
  app = getApp()
}

export const auth = app ? getAuth(app) : null

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
googleProvider.addScope('profile')
googleProvider.addScope('email')

