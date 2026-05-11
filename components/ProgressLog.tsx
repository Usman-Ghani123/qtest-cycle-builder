'use client'

import { useEffect, useRef } from 'react'
import styles from './ProgressLog.module.css'

interface ProgressLogProps {
  messages: string[]
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
              {msg}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
