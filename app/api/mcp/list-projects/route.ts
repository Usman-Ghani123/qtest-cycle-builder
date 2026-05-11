import { NextResponse } from 'next/server'
import { callMcpTool } from '@/lib/mcpClient'
import type { QTestProject } from '@/types/qtest'

export async function GET() {
  try {
    const result = await callMcpTool('list-projects', {})
    const projects = result as QTestProject[]
    console.log(`[MCP] list-projects → ${projects.length} projects`)
    return NextResponse.json({ projects })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to fetch projects'
    console.log(`[MCP] list-projects failed — ${error}`)
    return NextResponse.json({ projects: [], error })
  }
}
