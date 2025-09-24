/**
 * `/src/scripts/normalize-obsidian-vault-content.ts`
 *
 * This script normalizes the content of an Obsidian vault by processing each file,
 * converting its frontmatter to YAML, and writing the result to a normalized content directory.
 * It also ensures that attachments are symlinked to the public directory for easy access.
 * The first time it runs in a new installation, you will probably be asked for write access
 * for the symlinking of src/Attachments.
 */

import { dirname, join } from 'node:path'
import { existsSync, writeFileSync, rmSync } from 'node:fs' // , symlinkSync, existsSync } from 'node:fs'
import { loadVault } from '../lib/obsidian-vault-loader.ts'
import type { ObsidianFile } from '../lib/obsidian-vault-loader.ts'
import {
  OBSIDIAN_VAULT_PATH,
  NORMALIZED_CONTENT_PATH,
} from '../lib/consts.ts'
import { ensureDir } from '@std/fs/ensure-dir'
import { stringify as yaml } from '@std/yaml'

const vault = await loadVault(OBSIDIAN_VAULT_PATH)

if (existsSync(NORMALIZED_CONTENT_PATH)) {
  rmSync(NORMALIZED_CONTENT_PATH, { force: true, recursive: true })
}

const permalinkDataMapFile: ObsidianFile = {
  path: 'Data/PermalinkDataMap.md',
  content: '',
  data: {
    tags: ['no-search'],
    slug: 'permalink-data-map',
    files: {},
  },
}

for (const file of vault) {
  // Process each file as needed
  await writeNormalizedFile(file)
    ; (permalinkDataMapFile.data?.files! as { [key: string]: unknown })[file.data.permalink as string] = {
      path: file.path,
      data: file.data,
    }
}

await writeNormalizedFile(permalinkDataMapFile)

function toFrontmatterYaml(data: Record<string, unknown>): string {
  return `---\n${yaml(data).trim()}\n---\n`
}

async function writeNormalizedFile(file: ObsidianFile) {
  const filePath = join(NORMALIZED_CONTENT_PATH, file.path + "x") // .md -> .mdx
  await ensureDir(dirname(filePath))
  writeFileSync(filePath, toFrontmatterYaml(file.data) + file.content, 'utf-8')
}
