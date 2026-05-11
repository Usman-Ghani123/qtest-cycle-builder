import { NextResponse } from 'next/server'
import { readMcpConfig } from '@/lib/readMcpConfig'

const MCP_PROTOCOL_VERSION = '2024-11-05'

interface McpTool {
  name: string
  description: string
}

interface McpJsonRpcResponse {
  result?: {
    protocolVersion?: string
    tools?: McpTool[]
  }
  error?: { message: string }
}

async function mcpPost(
  url: string,
  authorization: string,
  body: object,
  sessionId?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    Authorization: authorization,
  }
  if (sessionId) headers['Mcp-Session-Id'] = sessionId

  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })
}

async function parseJsonRpc(res: Response): Promise<McpJsonRpcResponse> {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('text/event-stream')) {
    const text = await res.text()
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        return JSON.parse(line.slice(6)) as McpJsonRpcResponse
      }
    }
    return {}
  }
  return res.json() as Promise<McpJsonRpcResponse>
}

export async function GET() {
  const config = readMcpConfig()

  if (!config) {
    const error = '.vscode/mcp.json not found or invalid'
    console.log(`[MCP] Disconnected — ${error}`)
    return NextResponse.json({ isConnected: false, tools: [], error })
  }

  console.log(`[MCP] Initializing connection to ${config.url}`)

  try {
    // Step 1: initialize
    const initRes = await mcpPost(config.url, config.authorization, {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'qtest-cycle-builder', version: '0.1.0' },
      },
      id: 1,
    })

    if (!initRes.ok) {
      const error = `Initialize failed — HTTP ${initRes.status}`
      console.log(`[MCP] Disconnected — ${error}`)
      return NextResponse.json({ isConnected: false, tools: [], error })
    }

    const sessionId = initRes.headers.get('mcp-session-id') ?? undefined
    const initData = await parseJsonRpc(initRes)
    const protocol = initData.result?.protocolVersion ?? 'unknown'
    console.log(
      `[MCP] Initialized — protocol ${protocol}` +
        (sessionId ? `, session ${sessionId}` : '')
    )

    // Step 2: notifications/initialized (fire-and-forget)
    await mcpPost(
      config.url,
      config.authorization,
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      sessionId
    )

    // Step 3: tools/list
    const toolsRes = await mcpPost(
      config.url,
      config.authorization,
      { jsonrpc: '2.0', method: 'tools/list', params: {}, id: 2 },
      sessionId
    )

    const toolsData = await parseJsonRpc(toolsRes)
    const tools: McpTool[] = toolsData.result?.tools ?? []

    console.log(
      `[MCP] Connected — ${tools.length} tool(s): ${tools.map((t) => t.name).join(', ')}`
    )

    return NextResponse.json({ isConnected: true, tools })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to reach MCP server'
    console.log(`[MCP] Disconnected — ${error}`)
    return NextResponse.json({ isConnected: false, tools: [], error })
  }
}
