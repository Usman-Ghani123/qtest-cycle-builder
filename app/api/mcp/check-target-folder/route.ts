import { NextRequest, NextResponse } from 'next/server'
import { readMcpConfig } from '@/lib/readMcpConfig'
import { findTargetFolder } from '@/lib/qtest/testExecution'
import type { QTestConfig } from '@/types/qtest'

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId') ?? ''
  const folderName = request.nextUrl.searchParams.get('folderName') ?? ''
  try {
    const mcpConfig = readMcpConfig()
    if (!mcpConfig) return NextResponse.json({ exists: false })
    const baseUrl = mcpConfig.url.replace(/\/mcp\/?$/, '')
    const token = mcpConfig.authorization.replace(/^Bearer\s+/i, '')
    const config: QTestConfig = { baseUrl, token, projectId }
    await findTargetFolder(config, folderName)
    return NextResponse.json({ exists: true })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
