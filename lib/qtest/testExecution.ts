import { qtestFetch } from '@/lib/qtest/client'
import type { QTestConfig, QTestFolder } from '@/types/qtest'

interface RawCycle {
  id: number
  name: string
}

function toFolder(raw: RawCycle): QTestFolder {
  return { id: raw.id, name: raw.name }
}

/**
 * Extracts an array from a REST response that may be a raw array or a
 * paginated wrapper object (e.g. { items: [...] }, { data: [...] }).
 */
function extractArray<T>(result: unknown): T[] {
  if (!result) return []
  if (Array.isArray(result)) return result as T[]
  const obj = result as Record<string, unknown>
  for (const key of ['items', 'data', 'objects', 'results']) {
    if (Array.isArray(obj[key])) return obj[key] as T[]
  }
  return []
}

/**
 * Finds a root-level test cycle folder in Test Execution by name (case-insensitive)
 * using the REST test-cycles endpoint. Throws if no matching cycle is found.
 */
export async function findTargetFolder(
  config: QTestConfig,
  folderName: string
): Promise<QTestFolder> {
  const result = await qtestFetch(config, '/test-cycles', 'GET')
  const cycles = extractArray<RawCycle>(result)
  const found = cycles.find(
    (c) => c.name.toLowerCase() === folderName.toLowerCase()
  )

  if (!found) {
    throw new Error(`Target folder "${folderName}" not found in Test Execution`)
  }

  return toFolder(found)
}

/**
 * Creates a test cycle (or nested cycle folder) under a given parent via the REST API.
 * parentType must be 'root' for top-level or 'test-cycle' for nested.
 */
export async function createTestCycle(
  config: QTestConfig,
  name: string,
  parentId: number,
  parentType: 'root' | 'test-cycle'
): Promise<QTestFolder> {
  const data = await qtestFetch(
    config,
    `/test-cycles?parentId=${parentId}&parentType=${parentType}`,
    'POST',
    { name, description: '' }
  )
  return toFolder(data as RawCycle)
}

/**
 * Creates a test suite inside a test cycle via the REST API.
 * parentType is always 'test-cycle' per the qTest API contract.
 */
export async function createTestSuite(
  config: QTestConfig,
  name: string,
  parentId: number
): Promise<QTestFolder> {
  const data = await qtestFetch(
    config,
    `/test-suites?parentId=${parentId}&parentType=test-cycle`,
    'POST',
    { name }
  )
  return toFolder(data as RawCycle)
}

/**
 * Creates a single test run inside a test suite, pointing to a specific test case.
 */
export async function createTestRun(
  config: QTestConfig,
  name: string,
  suiteId: number,
  testCaseId: number
): Promise<void> {
  await qtestFetch(config, '/test-runs', 'POST', {
    name,
    parentId: suiteId,
    parentType: 'test-suite',
    test_case: { id: testCaseId },
  })
}
