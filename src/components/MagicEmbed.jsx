import { getCollection } from 'astro:content'
import { parseLinkTextMicroformat } from '../lib/microformats.ts'
import TopicGrid from './TopicGrid.jsx'
import YouTubeEmbed from './YouTubeEmbed.tsx'

const permalinkDataMapFile = (await getCollection('data')).find(
  (f) => f.data.slug === 'permalink-data-map',
)

function getFileByPermalink(permalink) {
  return permalinkDataMapFile.data.files[permalink]
}

export default function MagicEmbed({ src, alt }) {
  const topic = getFileByPermalink(src)

  const { text, directives } = parseLinkTextMicroformat(alt)

  // If the href is a known image extension let's just defer it to
  // astro's <Image> component.
  if (topic) {
    // Special Embedding for topics.
    if (directives.includes('topic-grid')) {
      // Get the links from the topic's data and fetch corresponding topic objects
      // for each link.
      const topics = topic.data.links.map(({ href }) =>
        getFileByPermalink(href),
      )
      return <TopicGrid topics={topics.filter(Boolean)} />
    }
  } else {
    if (
      `${src}`.startsWith('https://www.youtube.com') ||
      `${src}`.startsWith('https://youtube.com') ||
      `${src}`.startsWith('https://youtu.be')
    ) {
      return <YouTubeEmbed url={src} text={text} />
    }
    return (
      <figure>
        <img src={src.src} alt={alt || text || ''} />
        <figcaption>{text}</figcaption>
      </figure>
    )
  }
}
