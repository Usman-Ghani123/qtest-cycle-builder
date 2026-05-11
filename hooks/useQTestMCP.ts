'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MCPTool } from '@/types/qtest'

interface UseQTestMCPResult {
  isConnected: boolean
  tools: MCPTool[]
  error: string
  isLoading: boolean
  refetch: () => void
}

export function useQTestMCP(): UseQTestMCPResult {
  const [isConnected, setIsConnected] = useState(false)
  const [tools, setTools] = useState<MCPTool[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/debug/mcp-tools')
      const data = await res.json()
      setIsConnected(data.isConnected ?? false)
      setTools(data.tools ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach MCP status endpoint')
      setIsConnected(false)
      setTools([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { isConnected, tools, error, isLoading, refetch: fetchStatus }
}
