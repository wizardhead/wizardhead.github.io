import { join } from 'node:path'
export const SRC_PATH = join(import.meta.dirname!, '../../src')
export const PUBLIC_PATH = join(import.meta.dirname!, '../../public')
export const OBSIDIAN_VAULT_PATH = join(
  import.meta.dirname!,
  '../../content/obsidian-vault',
)
export const NORMALIZED_CONTENT_PATH = join(
  import.meta.dirname!,
  '../../content/normalized',
)
