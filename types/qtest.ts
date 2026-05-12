export interface QTestConfig {
  baseUrl: string
  token: string
  projectId: string
}

export interface QTestFolder {
  id: number
  name: string
  parentId?: number
  parentType?: string
  children?: QTestFolder[]
}

export type TypeFilter =
  | 'All'
  | 'Manual'
  | 'Automated'
  | 'Performance'
  | 'Scenario'
  | 'Future enhancement/feature'

export interface QTestTestCase {
  id: number
  name: string
  type: 'Manual' | 'Automated' | 'Performance' | 'Scenario' | 'Future enhancement/feature'
}

export interface QTestCycleParams {
  projectId: string
  sourceFolderName: string
  cycleName: string
  targetFolderName: string
  typeFilter: TypeFilter
}

export interface QTestProgress {
  message: string
  status: 'info' | 'success' | 'error'
  timestamp: string
}

export interface QTestProject {
  id: number
  name: string
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
