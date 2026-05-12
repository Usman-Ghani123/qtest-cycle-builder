import { NextRequest } from 'next/server'
import { readMcpConfig } from '@/lib/readMcpConfig'
import type { QTestConfig, QTestFolder, QTestCycleParams, QTestProgress, QTestTestCase } from '@/types/qtest'
import { getSourceFolder, getFolderTree, getTestCases } from '@/lib/qtest/testDesign'
import { findTargetFolder, findOrCreateTargetPath, createTestCycle, createTestSuite, createTestRun } from '@/lib/qtest/testExecution'

export async function POST(request: NextRequest) {
  const params: QTestCycleParams = await request.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function emit(message: string, status: QTestProgress['status']) {
        const progress: QTestProgress = {
          message,
          status,
          timestamp: new Date().toISOString(),
        }
        controller.enqueue(encoder.encode(JSON.stringify(progress) + '\n'))
      }

      try {
        const mcpConfig = readMcpConfig()
        if (!mcpConfig) {
          throw new Error('.vscode/mcp.json not found — cannot make REST API calls')
        }
        const baseUrl = mcpConfig.url.replace(/\/mcp\/?$/, '')
        const token = mcpConfig.authorization.replace(/^Bearer\s+/i, '')

        const config: QTestConfig = { baseUrl, token, projectId: params.projectId }

        async function collectTCs(folder: QTestFolder): Promise<Map<number, QTestTestCase[]>> {
          const map = new Map<number, QTestTestCase[]>()
          const tcs = await getTestCases(config, folder.id, params.typeFilter)
          if (tcs.length > 0) map.set(folder.id, tcs)
          for (const child of folder.children ?? []) {
            const childMap = await collectTCs(child)
            for (const [k, v] of childMap) map.set(k, v)
          }
          return map
        }

        function subtreeHasTCs(folder: QTestFolder, tcMap: Map<number, QTestTestCase[]>): boolean {
          if (tcMap.has(folder.id)) return true
          return (folder.children ?? []).some(c => subtreeHasTCs(c, tcMap))
        }

        async function createCycleTree(
          folder: QTestFolder,
          parentCycleId: number,
          tcMap: Map<number, QTestTestCase[]>
        ): Promise<number> {
          if (!subtreeHasTCs(folder, tcMap)) return 0

          const cycle = await createTestCycle(config, folder.name, parentCycleId, 'test-cycle')
          let runs = 0

          const tcs = tcMap.get(folder.id)
          if (tcs?.length) {
            emit(`📁 Processing: ${folder.name} (${tcs.length} test case(s))`, 'info')
            const suite = await createTestSuite(config, folder.name, cycle.id)
            for (const tc of tcs) {
              await createTestRun(config, tc.name, suite.id, tc.id)
              emit(`  ✅ Added: ${tc.name}`, 'info')
              runs++
            }
          }

          for (const child of folder.children ?? []) {
            runs += await createCycleTree(child, cycle.id, tcMap)
          }

          return runs
        }

        emit(`🔍 Finding source folder: ${params.sourceFolderName}...`, 'info')
        const sourceFolder = await getSourceFolder(config, params.sourceFolderName)
        emit(`✅ Found source folder: ${sourceFolder.name}`, 'success')

        emit('📂 Fetching folder tree...', 'info')
        const folderTree = await getFolderTree(config, sourceFolder)

        emit('🔄 Collecting test cases...', 'info')
        const tcMap = await collectTCs(folderTree)
        const totalTcs = [...tcMap.values()].reduce((sum, tcs) => sum + tcs.length, 0)
        emit(`📊 Found ${tcMap.size} folder(s) with ${totalTcs} matching test case(s)`, 'info')

        emit(`🗂 Finding target folder: ${params.targetFolderName}...`, 'info')
        let targetFolder: QTestFolder
        try {
          targetFolder = await findTargetFolder(config, params.targetFolderName)
          emit(`✅ Found target folder: ${targetFolder.name}`, 'success')
        } catch {
          if (params.createTargetFolderIfMissing) {
            emit(`📁 Creating target folder: ${params.targetFolderName}...`, 'info')
            targetFolder = await findOrCreateTargetPath(config, params.targetFolderName)
            emit(`✅ Created target folder: ${params.targetFolderName}`, 'success')
          } else {
            throw new Error(`Target folder "${params.targetFolderName}" not found in Test Execution`)
          }
        }

        emit(`🏗️ Creating test cycle: ${params.cycleName}...`, 'info')
        const mainCycle = await createTestCycle(config, params.cycleName, targetFolder.id, 'test-cycle')
        emit(`✅ Created test cycle: ${params.cycleName}`, 'success')

        let totalRuns = 0
        for (const child of folderTree.children ?? []) {
          totalRuns += await createCycleTree(child, mainCycle.id, tcMap)
        }

        emit(`🎉 Done! Created "${params.cycleName}" with ${totalRuns} test run(s)`, 'success')
      } catch (err) {
        emit(`❌ ${err instanceof Error ? err.message : String(err)}`, 'error')
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
