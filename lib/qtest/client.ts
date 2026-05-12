import type { QTestConfig } from '@/types/qtest'

/**
 * Base fetch wrapper for direct qTest REST API calls.
 * Constructs the full URL, attaches auth headers, and parses the JSON response.
 * Throws a descriptive error on any non-2xx response.
 */
export async function qtestFetch(
  config: QTestConfig,
  endpoint: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<unknown> {
  const url = `${config.baseUrl}/api/v3/projects/${config.projectId}${endpoint}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}
