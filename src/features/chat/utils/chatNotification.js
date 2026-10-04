import React from 'react'
import { toast } from 'react-toastify'

let notificationAudioCtx = null

/**
 * Phát âm thanh chuông báo tin nhắn đến (Messenger / Modern chime)
 * Sử dụng Web Audio API để không phụ thuộc vào tải file MP3, phát tức thì.
 */
export const playIncomingMessageSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!notificationAudioCtx) {
      notificationAudioCtx = new AudioContextClass()
    }
    if (notificationAudioCtx.state === 'suspended') {
      notificationAudioCtx.resume()
    }

    const ctx = notificationAudioCtx
    const now = ctx.currentTime

    // Tạo âm thanh ding-dong 2 nốt trong trẻo, vui tai
    const notes = [
      { freq: 880, start: 0, dur: 0.12, gainVal: 0.28 }, // A5
      { freq: 1318.51, start: 0.09, dur: 0.28, gainVal: 0.35 }, // E6
    ]

    notes.forEach(({ freq, start, dur, gainVal }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      gain.gain.setValueAtTime(0.001, now + start)
      gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + start)
      osc.stop(now + start + dur)
    })
  } catch (e) {
    console.warn('[ChatNotification] Audio playback error:', e)
  }
}

/**
 * Yêu cầu quyền thông báo trình duyệt nếu chưa được cấp
 */
export const requestDesktopNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (err) {
        console.warn('[ChatNotification] Permission request error:', err)
      }
    }
  }
}

/**
 * Hiển thị thông báo khi có tin nhắn mới đến:
 * - Desktop Notification (nếu tab đang ẩn hoặc trình duyệt có quyền)
 * - In-App Toast thông báo nổi góc màn hình
 */
export const showIncomingMessageNotification = ({
  senderName = 'Tin nhắn mới',
  content = '',
  avatar = '',
  onClick = null,
}) => {
  // 1. Desktop Notification
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(senderName, {
          body: content || 'Bạn vừa nhận được một tin nhắn mới',
          icon: avatar || '/favicon.ico',
          silent: true,
        })
        notif.onclick = () => {
          window.focus()
          notif.close()
          if (typeof onClick === 'function') onClick()
        }
      } catch (e) {
        console.warn('[ChatNotification] Desktop notification error:', e)
      }
    } else if (Notification.permission === 'default') {
      requestDesktopNotificationPermission()
    }
  }

  // 2. In-App Toast qua React.createElement thuần túy (không phụ thuộc cú pháp JSX của .jsx)
  toast.info(
    ({ closeToast }) =>
      React.createElement(
        'div',
        {
          className: 'flex items-center gap-3 cursor-pointer py-0.5 select-none',
          onClick: () => {
            closeToast()
            if (typeof onClick === 'function') onClick()
          },
        },
        avatar
          ? React.createElement('img', {
              src: avatar,
              alt: senderName,
              className: 'w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-primary-400',
            })
          : React.createElement(
              'div',
              {
                className:
                  'w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0',
              },
              (senderName || 'U').charAt(0).toUpperCase()
            ),
        React.createElement(
          'div',
          { className: 'min-w-0 flex-1' },
          React.createElement(
            'p',
            { className: 'font-bold text-sm text-slate-900 truncate' },
            senderName
          ),
          React.createElement(
            'p',
            { className: 'text-xs text-slate-600 truncate mt-0.5 font-medium' },
            content || 'Đã gửi cho bạn một tin nhắn'
          )
        )
      ),
    {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      className: 'shadow-xl rounded-2xl border border-primary-100 bg-white/95 backdrop-blur-sm',
    }
  )
}
