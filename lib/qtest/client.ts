import type { QTestConfig } from '@/types/qtest'

// This will handle all qTest API calls with Bearer token auth.
// All requests attach Authorization: Bearer <token> and target baseUrl/api/v3.
export async function qtestFetch(
  config: QTestConfig,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${config.baseUrl}/api/v3/projects/${config.projectId}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
      ...options.headers,
    },
  })
}
