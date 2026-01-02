import * as React from "react"
import { useState, useEffect } from "react"

const Countdown = ({ value, format = "HH:mm:ss", onFinish, valueStyle, className, ...props }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!value) return

    const targetTime = typeof value === 'number' ? value : new Date(value).getTime()
    const now = Date.now()
    const diff = Math.max(0, Math.floor((targetTime - now) / 1000))

    setTimeLeft(diff)

    if (diff <= 0) {
      onFinish?.()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onFinish?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [value, onFinish])

  const formatTime = (seconds) => {
    if (format === "ss") {
      return String(seconds).padStart(2, '0')
    }
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (format === "HH:mm:ss") {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <span style={valueStyle} className={className} {...props}>
      {formatTime(timeLeft)}
    </span>
  )
}

export { Countdown }


