import { callMcpTool } from '@/lib/mcpClient'
import { qtestFetch } from '@/lib/qtest/client'
import type { QTestConfig, QTestFolder, QTestTestCase, TypeFilter } from '@/types/qtest'

interface RawModule {
  id: number
  name: string
}

interface RawModuleWithChildren {
  id: number
  name: string
  children?: RawModuleWithChildren[]
}

interface RawProperty {
  field_value_name?: string | null
}

interface RawTestCase {
  id: number
  name: string
  properties?: RawProperty[]
}

const TYPE_ALIASES: Record<string, string> = {
  automation: 'Automated',
}

const KNOWN_TYPES = new Set(
  ['Manual', 'Automated', 'Performance', 'Scenario', 'Future enhancement/feature'].map((t) =>
    t.toLowerCase()
  )
)

function resolveTestType(tc: RawTestCase): string | null {
  for (const prop of tc.properties ?? []) {
    const raw = prop.field_value_name
    if (!raw) continue
    const lower = raw.toLowerCase()
    if (TYPE_ALIASES[lower]) return TYPE_ALIASES[lower]
    if (KNOWN_TYPES.has(lower)) return raw
  }
  return null
}

function flattenModules(modules: RawModuleWithChildren[]): QTestFolder[] {
  const result: QTestFolder[] = []
  for (const m of modules) {
    result.push({ id: m.id, name: m.name })
    if (m.children?.length) {
      result.push(...flattenModules(m.children))
    }
  }
  return result
}

/**
 * Extracts an array from an MCP/REST response that may be a raw array or a
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
 * Finds a module in Test Design by exact name (case-insensitive) using the search-modules MCP tool.
 * Throws if no matching module is found.
 */
export async function getSourceFolder(
  config: QTestConfig,
  folderName: string
): Promise<QTestFolder> {
  const result = await callMcpTool('search-modules', {
    projectId: Number(config.projectId),
    search: folderName,
  })

  const modules = extractArray<RawModule>(result)
  const found = modules.find(
    (m) => m.name.toLowerCase() === folderName.toLowerCase()
  )

  if (!found) {
    throw new Error(`Source folder "${folderName}" not found in Test Design`)
  }

  return { id: found.id, name: found.name }
}

/**
 * Fetches the full subfolder tree under a given folder using the REST modules endpoint.
 * Returns a flat list starting with the root folder, followed by all descendants.
 * Uses the REST API because search-modules requires a search term and cannot list all children.
 */
export async function getFolderTree(
  config: QTestConfig,
  folder: QTestFolder
): Promise<QTestFolder[]> {
  const result = await qtestFetch(config, `/modules?parentId=${folder.id}&expand=descendants`, 'GET')
  const topLevel = extractArray<RawModuleWithChildren>(result)
  return [folder, ...flattenModules(topLevel)]
}

async function fetchAllTestCases(config: QTestConfig, parentId: number): Promise<RawTestCase[]> {
  const all: RawTestCase[] = []
  let page = 1
  const size = 100

  while (true) {
    const result = await qtestFetch(
      config,
      `/test-cases?parentId=${parentId}&page=${page}&size=${size}&expand=properties`,
      'GET'
    )
    const batch = extractArray<RawTestCase>(result)
    all.push(...batch)
    if (batch.length < size) break
    page++
  }

  return all
}

/**
 * Fetches all test cases from a module via the REST API and optionally filters by type.
 * Handles pagination automatically (100 per page). When typeFilter is 'All', returns all.
 */
export async function getTestCases(
  config: QTestConfig,
  folderId: number,
  typeFilter: TypeFilter
): Promise<QTestTestCase[]> {
  const raw = await fetchAllTestCases(config, folderId)

  const result: QTestTestCase[] = []
  for (const tc of raw) {
    const resolved = resolveTestType(tc)
    if (typeFilter === 'All') {
      result.push({ id: tc.id, name: tc.name, type: (resolved ?? 'Manual') as QTestTestCase['type'] })
    } else if (resolved !== null && resolved.toLowerCase() === typeFilter.toLowerCase()) {
      result.push({ id: tc.id, name: tc.name, type: resolved as QTestTestCase['type'] })
    }
  }
  return result
}
