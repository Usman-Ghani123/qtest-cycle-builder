'use client'

import { useState, useEffect } from 'react'
import type { QTestCycleParams, QTestProject } from '@/types/qtest'
import styles from './CycleForm.module.css'

const TYPE_FILTER_OPTIONS: QTestCycleParams['typeFilter'][] = [
  'All',
  'Manual',
  'Automated',
  'Performance',
  'Scenario',
  'Future enhancement/feature',
]

const DEFAULT_FORM: QTestCycleParams = {
  projectId: '',
  sourceFolderName: '',
  cycleName: '',
  targetFolderName: '',
  typeFilter: 'All',
}

interface CycleFormProps {
  onLog: (message: string) => void
}

export default function CycleForm({ onLog }: CycleFormProps) {
  const [form, setForm] = useState<QTestCycleParams>(DEFAULT_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<QTestProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')

  useEffect(() => {
    fetch('/api/mcp/list-projects')
      .then((res) => res.json())
      .then((data: { projects: QTestProject[]; error?: string }) => {
        if (data.error) {
          setProjectsError(data.error)
        } else {
          setProjects(data.projects)
          if (data.projects.length > 0) {
            setForm((prev) => ({ ...prev, projectId: String(data.projects[0].id) }))
          }
        }
      })
      .catch((err: unknown) => {
        setProjectsError(err instanceof Error ? err.message : 'Failed to load projects')
      })
      .finally(() => setProjectsLoading(false))
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    onLog('Submitting cycle creation request...')
    try {
      const res = await fetch('/api/create-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const text = await res.text()
      onLog(`Response: ${text}`)
    } catch (err) {
      onLog(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="projectId">Project</label>
        <select
          id="projectId"
          name="projectId"
          value={form.projectId}
          onChange={handleChange}
          disabled={projectsLoading}
          required
        >
          {projectsLoading && <option value="">Loading projects…</option>}
          {!projectsLoading && projects.length === 0 && (
            <option value="">No projects found</option>
          )}
          {projects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        {projectsError && (
          <span className={styles.fieldError}>Could not load projects: {projectsError}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="sourceFolderName">Source Folder Name (Test Design)</label>
        <input
          id="sourceFolderName"
          name="sourceFolderName"
          type="text"
          placeholder="e.g. Regression Suite"
          value={form.sourceFolderName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="cycleName">Test Cycle Name</label>
        <input
          id="cycleName"
          name="cycleName"
          type="text"
          placeholder="e.g. Sprint 42 Regression"
          value={form.cycleName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="targetFolderName">Target Folder Name (Test Execution)</label>
        <input
          id="targetFolderName"
          name="targetFolderName"
          type="text"
          placeholder="e.g. Sprint 42"
          value={form.targetFolderName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="typeFilter">Type Filter</label>
        <select
          id="typeFilter"
          name="typeFilter"
          value={form.typeFilter}
          onChange={handleChange}
        >
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Test Cycle'}
      </button>
    </form>
  )
}
