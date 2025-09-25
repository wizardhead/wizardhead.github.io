import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import matter from 'gray-matter'
import { slug as slugify } from 'github-slugger'
import { resolveObsidianLink } from './resolve-obsidian-link.ts'
import { by, chronologically, descending } from './sorts.ts'

export interface ObsidianFile {
  path: string
  content: string
  data: { [key: string]: unknown }
}

export function extractImages(
  file: ObsidianFile,
): { src: string; alt: string }[] {
  const imageMatches = Array.from(file.content.matchAll(/!\[(.*?)\]\((.*?)\)/g))
  const images = []
  for (const match of imageMatches) {
    let [, alt, src] = match
    alt = alt.trim()
    src = src.trim()
    if (!src.startsWith('http') && !src.startsWith('/')) {
      src = src.replace(/^.*\/Attachments\//, `/Attachments/`)
    }
    if (src.match(/\.(png|gif|jpg|jpeg)$/)) {
      images.push({ alt, src })
    }
  }
  return images
}

export function extractLinks(
  file: ObsidianFile,
): { text: string; href: string }[] {
  const links = Array.from(file.content.matchAll(/\[(.*?)\]\((.*?)\)/g)).map(
    (match) => {
      const [, text, href] = match
      return { text, href }
    },
  )
  return links
}

export async function convertObsidianWikilinksToMarkdown(
  file: ObsidianFile,
  vaultRoot: string,
  pathToPermalink: Map<string, string>,
) {
  // Regex to match [[Page]] or [[Page|Display Text]], and ![[Page]] for embeds
  const wikiLinkMatches = [
    ...file.content.matchAll(/(!)?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g),
  ]
  const replacements = await Promise.all(
    wikiLinkMatches.map(async (match) => {
      const [_fullMatch, embed, link, display] = match
      let resolvedPath = await resolveObsidianLink(
        file.path,
        link.trim(),
        vaultRoot,
      )
      if (!resolvedPath) {
        return _fullMatch
      }
      const linkText = display ? display.trim() : link.trim()
      const permalink = pathToPermalink.get(resolvedPath)
      if (embed) {
        // For embeds of attachment files, we need to adjust the path to be
        // relative to the current file and in the source vault folder so
        // we don't have to copy assets just to resolve.
        resolvedPath = path
          .relative(`/ ${file.path}`, resolvedPath)
          .replace('../Attachments/', '../obsidian-vault/Attachments/')
        // Embedding images is already handled by Markdown renderer as that is
        // standard meaning of ![]().  If we want to embed other media, we may
        // need a separate syntax or plugin.  For now, we'll just use frontmatter
        // for special media rendering like embedded soundcloud or youtube media.

        // We need to use %20 for spaces in URLs in order for astro to deal with
        // spaces in filenames for the image processing pipeline.
        resolvedPath = resolvedPath.replace(/ /g, '%20')
        return `![${linkText}](${permalink || resolvedPath})`
      }
      // Standard Markdown link
      return `[${linkText}](${permalink})`
    }),
  )
  wikiLinkMatches.forEach((match, i) => {
    file.content = file.content.replace(match[0], replacements[i])
  })
}

/**
 * Sets the title of a DataEntry based on the first h1 line in its body.
 * If the title is already set in the data object, it does not modify it.
 * This is useful for ensuring that the title is derived from the content
 * if not explicitly provided.
 */
export function setTitleFromH1(file: ObsidianFile) {
  // Extract the first h1 line as the title if it exists and if there is no
  // title already set in the data object.
  if (!file.data.title) {
    const match = file.content.match(/^[^\S\n]*#[^\S\n]+([^\n]*)[^\S\n]*$/m)
    if (match) {
      file.data.title = match[1].trim()
      file.content = file.content.replace(match[0], '').trim()
    }
  }
}

export function setTitleFromPath(file: ObsidianFile) {
  file.data.title =
    file.data.title || path.basename(file.path).replace(/\.md$/, '')
}

/**
 * Moves inline properties from the body of a DataEntry to its data object.
 */
export function moveInlinePropertiesToData(file: ObsidianFile) {
  extendDataWithInlineProperties(file)
  file.content = file.content.replace(/^[^\n:]+::[^\n]+(?:\n|$)/gm, '')
}

/**
 * Returns an object containing inline properties found in the markdown body.
 */
export function getInlinePropertiesFromMarkdown(markdown: string) {
  const inlineProperties: { [key: string]: string } = {}
  const lines = markdown.split('\n')

  for (const line of lines) {
    const match = line.match(/^\s*([^:]+)\s*::\s*(.*)\s*$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      inlineProperties[key] = value
    }
  }

  return inlineProperties
}

export function extendDataWithInlineProperties(file: ObsidianFile) {
  const inlineProperties = getInlinePropertiesFromMarkdown(file.content)
  file.data = { ...file.data, ...inlineProperties }
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  let files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(await getMarkdownFiles(fullPath))
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
    ) {
      files.push(fullPath)
    }
  }
  return files
}

export async function vanillaLoadVault(
  vaultPath: string,
): Promise<ObsidianFile[]> {
  const allFiles: ObsidianFile[] = []
  const files = await getMarkdownFiles(vaultPath)

  for (const filePath of files) {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    allFiles.push({
      path: path.relative(vaultPath, filePath),
      content,
      data,
    })
  }
  return allFiles
}

function setPublishedDateFromFileName(file: ObsidianFile) {
  if (!file.data.published && file.path.match(/\/(\d{4}-\d{2}-\d{2})/)) {
    const match = file.path.match(/\/(\d{4}-\d{2}-\d{2})/)
    if (match) {
      file.data.published = new Date(match[1])
    }
  }
}

function setSlug(file: ObsidianFile) {
  if (file.data.slug) {
    return // already set
  }
  file.data.slug = slugify(file.data.title as string)
}

// TODO(usergenic): It would be nice if this was some kind of reflection of
// the router/file-layout instead of a replication of that logic.
function setPermalink(file: ObsidianFile) {
  if (file.data.permalink) {
    return
  }
  // Add logic here to support different permalink structures based mostly on
  // file location.
  const { slug } = file.data
  if (file.path.startsWith('Blog/')) {
    if (!file.data.published) {
      // If there's no published date, we can't create a permalink with date info.
      return
    }
    const published = file.data.published as Date
    const year = published.getFullYear()
    const month = String(published.getMonth() + 1).padStart(2, '0')
    const day = String(published.getUTCDate()).padStart(2, '0')
    file.data.permalink = `/blog/${year}/${month}/${day}/${slug}`
    return
  }
  // Permalink should reflect information architecture of file location
  const segments = file.path.split('/')
  segments.pop() // Remove the filename itself since we are using slugs.
  if (segments[0] === 'Topics') {
    segments.shift()
  }
  // The leading comma in the array is so we get a leading '/' when we join.
  file.data.permalink = [
    ,
    ...segments.map((s) => slugify(s)),
    file.data.slug,
  ].join('/')
}

function hoistTagsFromBody(file: ObsidianFile) {
  if (!Array.isArray(file.data.tags)) {
    file.data.tags = []
  }
  const tags: string[] = file.data.tags as string[]
  file.content = file.content.replaceAll(/(?<!#)#([^#\s]+)\s*/g, (_match, tag) => {
    tags.push(tag)
    return ''
  })
}

export async function loadVault(vaultPath: string): Promise<ObsidianFile[]> {
  const files = await vanillaLoadVault(vaultPath)
  const pathToPermalink = new Map<string, string>()
  for (const file of files) {
    // Move inline properties to the data object.
    moveInlinePropertiesToData(file)
    // Set default title from the first H1 tag in the content.
    setTitleFromH1(file)
    // Set title from the file path if not already set.
    setTitleFromPath(file)
    // Set published date from the file name if applicable.
    setPublishedDateFromFileName(file)
    // Set default slug from the slugified title.
    setSlug(file)
    // Set the "permalink" field, which is the slug plus any needed prefix.
    // For example, blog posts are under /blog/[year]/[month]/[day]/[slug].
    setPermalink(file)
    // Record the file path to slug mapping.
    pathToPermalink.set(`/${file.path}`, file.data.permalink as string)
    // Gather tags from the document body
    hoistTagsFromBody(file)
  }
  // We have to wait until we have the pathToPermalink mapping before we can
  // properly convert the Obsidian wiki-links to absolute markdown links
  // because we want to use permalinks in destination.
  for (const file of files) {
    // Convert Obsidian wiki-links to absolute markdown links.
    await convertObsidianWikilinksToMarkdown(file, vaultPath, pathToPermalink)
    // Make an array in the frontmatter representing all links in
    // the content.
    file.data.images = extractImages(file)
    file.data.links = extractLinks(file)
  }
  // Set the next_post and previous_post data on blog entries.
  const posts = files
    .filter((f) => `${f.data.permalink}`.match(/^\/blog\/\d+\/\d+\/\d+\/.+$/))
    .sort(descending(by(chronologically((f) => f.data?.published as Date))))
  for (let p = 0; p < posts.length; ++p) {
    if (p > 0) {
      posts[p].data.next_page = posts[p - 1].data.permalink
    }
    if (p < posts.length - 1) {
      posts[p].data.previous_page = posts[p + 1].data.permalink
    }
  }
  return files
}
