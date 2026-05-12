'use client'

import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">×</button>
        <p className={styles.title}>Folder Not Found</p>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
          <button className={styles.btnPrimary} onClick={onConfirm}>Create Folder</button>
        </div>
      </div>
    </div>
  )
}
