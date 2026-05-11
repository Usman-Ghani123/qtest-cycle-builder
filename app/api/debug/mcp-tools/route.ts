import { NextResponse } from 'next/server'
import { readMcpConfig } from '@/lib/readMcpConfig'
import { listMcpTools } from '@/lib/mcpClient'

export async function GET() {
  const config = readMcpConfig()

  if (!config) {
    const error = '.vscode/mcp.json not found or invalid'
    console.log(`[MCP] Disconnected — ${error}`)
    return NextResponse.json({ isConnected: false, tools: [], error })
  }

  console.log(`[MCP] Initializing connection to ${config.url}`)

  try {
    const tools = await listMcpTools()
    console.log(`[MCP] Connected — ${tools.length} tool(s): ${tools.map((t) => t.name).join(', ')}`)
    return NextResponse.json({ isConnected: true, tools })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to reach MCP server'
    console.log(`[MCP] Disconnected — ${error}`)
    return NextResponse.json({ isConnected: false, tools: [], error })
  }
}
