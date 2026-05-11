import type { QTestConfig, QTestFolder, QTestTestCase } from '@/types/qtest'

export async function getSourceFolder(
  config: QTestConfig,
  folderName: string
): Promise<QTestFolder> {
  void config
  void folderName
  return { id: '', name: '', children: [] }
}

export async function getFolderTree(
  config: QTestConfig,
  folderId: string
): Promise<QTestFolder[]> {
  void config
  void folderId
  return []
}

export async function getTestCases(
  config: QTestConfig,
  folderId: string,
  typeFilter: string
): Promise<QTestTestCase[]> {
  void config
  void folderId
  void typeFilter
  return []
}
