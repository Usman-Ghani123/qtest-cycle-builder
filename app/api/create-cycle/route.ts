import { NextRequest } from 'next/server'
import { readMcpConfig } from '@/lib/readMcpConfig'
import type { QTestConfig, QTestCycleParams, QTestProgress, QTestTestCase } from '@/types/qtest'
import { getSourceFolder, getFolderTree, getTestCases } from '@/lib/qtest/testDesign'
import { findTargetFolder, createTestCycle, createTestSuite, createTestRun } from '@/lib/qtest/testExecution'

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

        emit(`🔍 Finding source folder: ${params.sourceFolderName}...`, 'info')
        const sourceFolder = await getSourceFolder(config, params.sourceFolderName)
        emit(`✅ Found source folder: ${sourceFolder.name}`, 'success')

        emit('📂 Fetching folder tree...', 'info')
        const allFolders = await getFolderTree(config, sourceFolder)

        const folderTestCases = new Map<number, QTestTestCase[]>()
        for (const folder of allFolders) {
          const tcs = await getTestCases(config, folder.id, params.typeFilter)
          if (tcs.length > 0) {
            folderTestCases.set(folder.id, tcs)
          }
        }

        const foldersWithTcs = allFolders.filter((f) => folderTestCases.has(f.id))
        const totalTcs = [...folderTestCases.values()].reduce((sum, tcs) => sum + tcs.length, 0)
        emit(`📊 Found ${foldersWithTcs.length} folder(s) with ${totalTcs} matching test case(s)`, 'info')

        emit(`🗂 Finding target folder: ${params.targetFolderName}...`, 'info')
        const targetFolder = await findTargetFolder(config, params.targetFolderName)
        emit(`✅ Found target folder: ${targetFolder.name}`, 'success')

        emit(`🏗️ Creating test cycle: ${params.cycleName}...`, 'info')
        const mainCycle = await createTestCycle(config, params.cycleName, targetFolder.id, 'test-cycle')
        emit(`✅ Created test cycle: ${params.cycleName}`, 'success')

        let totalRuns = 0
        for (const folder of foldersWithTcs) {
          const tcs = folderTestCases.get(folder.id)!
          emit(`📁 Processing: ${folder.name} (${tcs.length} test case(s))`, 'info')

          const subCycle = await createTestCycle(config, folder.name, mainCycle.id, 'test-cycle')
          const suite = await createTestSuite(config, folder.name, subCycle.id)

          for (const tc of tcs) {
            await createTestRun(config, tc.name, suite.id, tc.id)
            emit(`  ✅ Added: ${tc.name}`, 'info')
            totalRuns++
          }
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
