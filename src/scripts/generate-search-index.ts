// scripts/generate-search-index.js
import fs from 'node:fs'
import { NORMALIZED_CONTENT_PATH } from "../lib/consts.ts"
import { loadVault } from '../lib/obsidian-vault-loader.ts'
import type { ObsidianFile } from '../lib/obsidian-vault-loader.ts'
import { removeMarkup } from '../lib/text-utils.ts'

const vault = await loadVault(NORMALIZED_CONTENT_PATH)
const excluded: string[] = [
  '/subscribe/thank-you',
]
const index = vault
  .map((file: ObsidianFile) => {
    const { title, permalink } = file.data
    if ((file.data.tags as string[]).includes('no-search')) {
      return null // Skip this entry
    }
    if (excluded.includes(permalink as string)) {
      return null // Skip this entry
    }
    // Strip markdown markup and get plain text from body
    const bodyTextOnly = removeMarkup(file.content)
    return { title, url: permalink, body: bodyTextOnly }
  })
  .filter(Boolean) // Remove null entries

fs.writeFileSync('public/search-index.json', JSON.stringify(index))
