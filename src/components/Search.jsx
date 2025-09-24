import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'

function indexLength(index) {
  return index[1] - index[0]
}

function longestIndexLength(indices) {
  let longest = null
  for (const index of indices) {
    const length = indexLength(index)
    if (!longest || indexLength(longest) < length) {
      longest = index
    }
  }
  return longest
}

// Helper function to create a highlighted excerpt for a given text and its specific matches
const createHighlightedText = (text, matchesForThisText) => {
  if (!text || !matchesForThisText || matchesForThisText.length === 0) {
    return text // Return original text if no matches or text is empty
  }

  const highlightedParts = []
  let lastIndex = 0

  // Sort matches by their start index to process them in order
  matchesForThisText.sort((a, b) => a[0] - b[0])

  for (const [start, endInclusive] of matchesForThisText) {
    const endExclusive = endInclusive + 1

    // Add the text before the current match
    if (start > lastIndex) {
      highlightedParts.push(text.substring(lastIndex, start))
    }

    // Add the highlighted match
    highlightedParts.push(`<mark>${text.substring(start, endExclusive)}</mark>`)
    lastIndex = endExclusive
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    highlightedParts.push(text.substring(lastIndex, text.length))
  }

  return highlightedParts.join('')
}

// Helper function to create an excerpt, specifically for body content
const createBodyExcerpt = (text, matches, _query) => {
  if (!text || !matches || matches.length === 0) {
    return null // Return null if no body matches, so we don't display an empty excerpt
  }

  // Find the match within the body that has the smallest index (first occurrence)
  let bestBodyMatch = null
  let bestBodyMatchIndex = null
  let bestBodyMatchIndexLength = 0
  for (const match of matches) {
    if (match.key === 'body' && match.indices && match.indices.length > 0) {
      const currentLongestIndex = longestIndexLength(match.indices)
      const currentLongestIndexLength = indexLength(currentLongestIndex)
      if (
        !bestBodyMatch ||
        indexLength(currentLongestIndex) > bestBodyMatchIndexLength
      ) {
        bestBodyMatch = match
        bestBodyMatchIndex = currentLongestIndex
        bestBodyMatchIndexLength = currentLongestIndexLength
      }
    }
  }

  if (!bestBodyMatch) {
    return null // No body match found
  }

  const [matchStart, matchEndInclusive] = bestBodyMatchIndex
  const matchEndExclusive = matchEndInclusive + 1 // Convert to exclusive end for substring

  const excerptLength = 100 // Total desired length of the excerpt
  const contextPadding = 30 // Characters to show before/after the match

  let excerptStart = Math.max(0, matchStart - contextPadding)
  let excerptEnd = Math.min(text.length, matchEndExclusive + contextPadding)

  // Adjust if the excerpt is too short (e.g., at the beginning or end of the text)
  if (excerptEnd - excerptStart < excerptLength) {
    excerptEnd = Math.min(text.length, excerptStart + excerptLength)
    if (excerptEnd - excerptStart < excerptLength) {
      // Still too short? Try extending backwards
      excerptStart = Math.max(0, excerptEnd - excerptLength)
    }
  }

  // Ensure excerpt boundaries are valid
  excerptStart = Math.max(0, excerptStart)
  excerptEnd = Math.min(text.length, excerptEnd)

  // Build the excerpt
  let prefix = ''
  if (excerptStart > 0) {
    prefix = '...'
  }

  let suffix = ''
  if (excerptEnd < text.length) {
    suffix = '...'
  }

  const excerptText = text.substring(excerptStart, excerptEnd)

  // Now, we need to highlight within this *excerpt*, not the whole body
  // Filter matches to only those relevant to the current excerpt's range
  const relevantMatchesForExcerpt = bestBodyMatch.indices
    .filter(([s, e]) => s >= excerptStart && e + 1 <= excerptEnd)
    .map(([s, e]) => [s - excerptStart, e - excerptStart]) // Adjust indices to be relative to excerptText
    .filter(
      (index) => indexLength(index) > (bestBodyMatchIndexLength > 1 ? 1 : 0),
    )

  const highlightedExcerpt = createHighlightedText(
    excerptText,
    relevantMatchesForExcerpt,
  )

  return `${prefix}${highlightedExcerpt}${suffix}`
}

const createBodyExcerptNoMatch = (body) => {
  if (!body) {
    return null
  }

  const excerptLength = 100
  const excerpt =
    body.length > excerptLength
      ? body.substring(0, excerptLength) + '...'
      : body
  return excerpt
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [fuse, setFuse] = useState(null)

  useEffect(() => {
    if (query && !fuse) {
      fetch(
        `/search-index.json?freshness=${new Date().toLocaleDateString('en-US')}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const newFuse = new Fuse(data, {
            keys: ['title', 'body'],
            threshold: 0.3,
            ignoreDiacritics: true,
            ignoreLocation: true,
            includeMatches: true,
            includeScore: true,
          })
          setFuse(newFuse)
          setResults(newFuse.search(query))
        })
    }
  }, [query, fuse])

  useEffect(() => {
    if (fuse && query) {
      setResults(fuse.search(query))
    } else {
      setResults([])
    }
  }, [query, fuse])

  return (
    <dialog
      id="search-dialog"
      style={{ width: '90%', top: '5%' }}
      onClick={(event) => {
        const dialog = document.getElementById('search-dialog')
        if (event.target === dialog) {
          dialog.close()
        }
      }}
    >
      <div>
        <input
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%' }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') {
              return
            }
            const link = document.querySelector('#search-dialog li a')
            console.log(link)
            if (!link) {
              return
            }
            link.focus()
            link.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          }}
        />
        <ul>
          {results.map((result) => {
            const titleMatches = result.matches
              ? result.matches.filter((m) => m.key === 'title')
              : []
            const bodyMatches = result.matches
              ? result.matches.filter((m) => m.key === 'body')
              : []

            const highlightedTitle =
              titleMatches.length > 0
                ? createHighlightedText(
                    result.item.title,
                    titleMatches[0].indices,
                  ) // Assuming only one match array per key for simplicity
                : result.item.title

            const bodyExcerpt =
              createBodyExcerpt(result.item.body, bodyMatches, query) ||
              createBodyExcerptNoMatch(result.item.body)

            return (
              <li key={result.item.url}>
                <a
                  href={result.item.url}
                  dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                />
                {bodyExcerpt && (
                  <p dangerouslySetInnerHTML={{ __html: bodyExcerpt }} />
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </dialog>
  )
}
