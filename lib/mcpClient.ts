import { readMcpConfig } from '@/lib/readMcpConfig'

const MCP_PROTOCOL_VERSION = '2024-11-05'

interface McpJsonRpcResponse {
  result?: Record<string, unknown>
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

async function handshake(): Promise<{ url: string; authorization: string; sessionId?: string }> {
  const config = readMcpConfig()
  if (!config) throw new Error('.vscode/mcp.json not found or invalid')

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

  if (!initRes.ok) throw new Error(`Initialize failed — HTTP ${initRes.status}`)

  const sessionId = initRes.headers.get('mcp-session-id') ?? undefined
  await parseJsonRpc(initRes)

  await mcpPost(
    config.url,
    config.authorization,
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    sessionId
  )

  return { url: config.url, authorization: config.authorization, sessionId }
}

export async function listMcpTools(): Promise<{ name: string; description: string }[]> {
  const { url, authorization, sessionId } = await handshake()

  const res = await mcpPost(
    url,
    authorization,
    { jsonrpc: '2.0', method: 'tools/list', params: {}, id: 2 },
    sessionId
  )
  const data = await parseJsonRpc(res)
  return (data.result?.tools as { name: string; description: string }[]) ?? []
}

export async function callMcpTool(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const { url, authorization, sessionId } = await handshake()

  const res = await mcpPost(
    url,
    authorization,
    {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: args },
      id: 3,
    },
    sessionId
  )

  const data = await parseJsonRpc(res)
  if (data.error) throw new Error(data.error.message)

  const content = data.result?.content as { type: string; text?: string }[] | undefined
  const textItem = content?.find((c) => c.type === 'text')
  if (!textItem?.text) return null

  try {
    return JSON.parse(textItem.text)
  } catch {
    return textItem.text
  }
}
