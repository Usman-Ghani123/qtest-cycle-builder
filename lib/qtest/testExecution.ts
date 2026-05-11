import type { QTestConfig, QTestFolder, QTestTestCase } from '@/types/qtest'

export async function getTargetFolder(
  config: QTestConfig,
  folderName: string
): Promise<QTestFolder> {
  void config
  void folderName
  return { id: '', name: '', children: [] }
}

export async function createTestCycle(
  config: QTestConfig,
  targetFolderId: string,
  cycleName: string
): Promise<QTestFolder> {
  void config
  void targetFolderId
  void cycleName
  return { id: '', name: '', children: [] }
}

export async function createTestSuite(
  config: QTestConfig,
  cycleId: string,
  name: string
): Promise<QTestFolder> {
  void config
  void cycleId
  void name
  return { id: '', name: '', children: [] }
}

export async function addTestRuns(
  config: QTestConfig,
  suiteId: string,
  testCases: QTestTestCase[]
): Promise<void> {
  void config
  void suiteId
  void testCases
}
