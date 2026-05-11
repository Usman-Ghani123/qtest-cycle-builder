import fs from 'fs'
import path from 'path'

export interface McpServerEntry {
  url: string
  authorization: string
}

export function readMcpConfig(): McpServerEntry | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.vscode', 'mcp.json'), 'utf-8')
    const cfg = JSON.parse(raw) as {
      servers: Record<string, { url: string; headers?: Record<string, string> }>
    }
    const server = Object.values(cfg.servers)[0]
    if (!server?.url) return null
    return {
      url: server.url,
      authorization: server.headers?.Authorization ?? '',
    }
  } catch {
    return null
  }
}
