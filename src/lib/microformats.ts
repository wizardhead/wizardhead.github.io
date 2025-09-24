// Directives are expressed in link text with curlies: {topic-card}
export function parseLinkTextMicroformat(displayText: string): { directives: string[], text: string } {
  const directives: string[] = []
  const text = displayText.replaceAll(/\~([a-z0-9\-]+)/g, (_, m1: string) => {
    directives.push(m1.trim())
    return ''
  }).trim()
  return { text, directives };
}
