'use client'

import { useState } from 'react'
import CycleForm from '@/components/CycleForm'
import ProgressLog from '@/components/ProgressLog'
import { useQTestMCP } from '@/hooks/useQTestMCP'
import styles from './page.module.css'

export default function HomePage() {
  const { isConnected, isLoading, tools } = useQTestMCP()
  const [logs, setLogs] = useState<string[]>([])

  function addLog(message: string) {
    setLogs((prev) => [...prev, message])
  }

  function statusBadge() {
    if (isLoading) return <span className={`${styles.badge} ${styles.checking}`}>⏳ Checking...</span>
    if (isConnected) return <span className={`${styles.badge} ${styles.connected}`}>🟢 Connected ({tools.length} tools)</span>
    return <span className={`${styles.badge} ${styles.disconnected}`}>🔴 Disconnected</span>
  }

  return (
    <>
      <section className={styles.status}>
        <span className={styles.statusLabel}>MCP Connection</span>
        {statusBadge()}
      </section>

      <CycleForm onLog={addLog} />

      <ProgressLog messages={logs} />
    </>
  )
}
