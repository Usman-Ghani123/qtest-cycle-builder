'use client'

import { useEffect, useRef } from 'react'
import type { QTestProgress } from '@/types/qtest'
import styles from './ProgressLog.module.css'

interface ProgressLogProps {
  messages: QTestProgress[]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function ProgressLog({ messages }: ProgressLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Progress Log</div>
      <div className={styles.body}>
        {messages.length === 0 ? (
          <span className={styles.empty}>Waiting to start...</span>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={styles.line}>
              <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
              <span className={styles[msg.status]}>{msg.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
