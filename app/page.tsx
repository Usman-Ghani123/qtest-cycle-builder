'use client'

import { useState } from 'react'
import CycleForm from '@/components/CycleForm'
import ProgressLog from '@/components/ProgressLog'
import { useQTestMCP } from '@/hooks/useQTestMCP'
import type { QTestProgress } from '@/types/qtest'
import styles from './page.module.css'

export default function HomePage() {
  const { isConnected, isLoading, tools } = useQTestMCP()
  const [logs, setLogs] = useState<QTestProgress[]>([])

  function addProgress(progress: QTestProgress) {
    setLogs((prev) => [...prev, progress])
  }

  function statusBadge() {
    if (isLoading) {
      return <span className={`${styles.badge} ${styles.checking}`}>⏳ Checking connection...</span>
    }
    if (isConnected) {
      return (
        <span className={`${styles.badge} ${styles.connected}`}>
          🟢 Connected to qTest MCP ({tools.length} tools available)
        </span>
      )
    }
    return (
      <span className={`${styles.badge} ${styles.disconnected}`}>
        🔴 MCP Disconnected — check .vscode/mcp.json
      </span>
    )
  }

  return (
    <>
      <section className={styles.status}>
        <span className={styles.statusLabel}>MCP Connection</span>
        {statusBadge()}
      </section>

      <CycleForm
        onProgress={addProgress}
        onSubmitStart={() => setLogs([])}
      />

      <ProgressLog messages={logs} />
    </>
  )
}
