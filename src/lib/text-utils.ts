export function removeMarkup(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove inline code
    .replace(/^\s*#\s+.*$/m, '') // Remove h1 heading line entirely
    .replace(/^\s*#{1,6}\s*/gm, '') // Remove headings
    .replace(/^\s*>\s?/g, '') // Remove blockquotes
    .replace(/[*_~`]/g, '') // Remove formatting characters
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/---/g, '') // Remove horizontal rules
    .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
    .trim()
}

export function excerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  let trimmedText = text.slice(0, maxLength)
  trimmedText = trimmedText.replace(/[^\s]+$/, '').trim()
  return `${trimmedText}...`
}