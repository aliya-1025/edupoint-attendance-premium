import { useState, useEffect } from 'react'

export function useLiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const h = time.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12

  return {
    timeStr: `${pad(h12)}:${pad(time.getMinutes())}:${pad(time.getSeconds())} ${ampm}`,
    dateStr: time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    greeting: h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening',
    emoji: h < 12 ? '☀️' : h < 17 ? '🌤️' : '🌙',
  }
}
