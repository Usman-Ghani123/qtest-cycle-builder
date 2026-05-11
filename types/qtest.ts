export interface QTestConfig {
  baseUrl: string
  token: string
  projectId: string
}

export interface QTestFolder {
  id: string
  name: string
  children: QTestFolder[]
}

export interface QTestTestCase {
  id: string
  name: string
  type: string
}

export interface QTestCycleParams {
  projectId: string
  sourceFolderName: string
  cycleName: string
  targetFolderName: string
  typeFilter: 'All' | 'Manual' | 'Automated' | 'Performance' | 'Scenario' | 'Future enhancement/feature'
}

export interface MCPTool {
  name: string
  description: string
}

export interface MCPConnectionStatus {
  isConnected: boolean
  tools: MCPTool[]
  error?: string
}
