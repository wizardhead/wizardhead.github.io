import path from 'node:path'
import fs from 'node:fs'
import { expandGlob } from '@std/fs'
import { asyncIterableToArray } from './async.ts'

/**
 * Resolves an Obsidian-style link to an absolute file path within your Astro content directory.
 * This function mimics Obsidian's default link resolution behavior, checking for notes (.md)
 * and other assets based on relative and root-level paths.
 *
 * @param currentFilePath The absolute path of the file containing the Obsidian link.
 * Example: '/Users/youruser/project/src/content/notes/daily-log.md'
 * @param obsidianLinkText The plain text inside the Obsidian link, e.g., 'My Note', 'subfolder/image.png',
 * 'Another Note#Heading', 'My Note|Alias'. Aliases, headings, and block IDs
 * are ignored for file resolution.
 * @param contentRoot The absolute path to your Astro project's content root directory. This is
 * considered the "vault root" for absolute Obsidian links.
 * Example: '/Users/youruser/project/src/content'
 * @returns The absolute path to the resolved file, or `null` if no matching file is found.
 */
export async function resolveObsidianLink(
  currentFilePath: string,
  obsidianLinkText: string,
  contentRoot: string,
): Promise<string | null> {
  // 1. Extract the base link target (remove alias, heading, and block ID)
  let linkTarget = obsidianLinkText.split('|')[0] // Remove alias (e.g., 'My Note|Alias' -> 'My Note')
  linkTarget = linkTarget.split('#')[0] // Remove heading (e.g., 'My Note#Heading' -> 'My Note')
  linkTarget = linkTarget.split('^')[0] // Remove block ID (e.g., 'My Note^blockid' -> 'My Note')

  // We don't deal with extensions yet in the links
  // const currentDir = path.dirname(currentFilePath)
  // const hasExtension = path.extname(linkTarget) !== "" // Check if the link text explicitly includes an extension

  // Define potential paths to check, in the order Obsidian typically resolves them:
  // 1. Relative to the current file's directory.
  // 2. Relative to the content root (acting as the "vault root").
  const potentialPaths: string[] = (
    await asyncIterableToArray(expandGlob(`${contentRoot}/**/${linkTarget}`))
  )
    .concat(
      await asyncIterableToArray(
        expandGlob(`${contentRoot}/**/${linkTarget}.*`),
      ),
    )
    .map((w) => w.path)
    .filter((p) => fs.statSync(p).isFile())

  // 2. Check for existence in the defined order
  for (const p of potentialPaths) {
    // Normalize the path to resolve '..' and '.' for consistent file system checks
    const resolvedPath = path.normalize(p)
    if (fs.existsSync(resolvedPath)) {
      const shortenedPath = resolvedPath.replace(contentRoot, '')
      return shortenedPath
    }
  }

  return null // No matching file found
}
