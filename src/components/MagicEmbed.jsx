import { getCollection } from 'astro:content'
// import * as path from 'node:path'
// import { getVaultImage } from '../lib/images.ts'
// import { Image } from 'astro:assets'
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
      src.src.startsWith('https://www.youtube.com') ||
      src.src.startsWith('https://youtube.com') ||
      src.src.startsWith('https://youtu.be')
    ) {
      return <YouTubeEmbed url={src} text={text} />
    }
    // if (src.src.startsWith('/@fs/')) {
    //   const vaultPath = src.src
    //     .replace(/(\?|\#).*$/g, '')
    //     .replace(
    //       /^.+\/Attachments\//,
    //       '../../content/obsidian-vault/Attachments/',
    //     )
    //   const vaultImage = await getVaultImage(vaultPath)
    //   if (vaultImage) {
    //     console.log('Rendering vault image for ', vaultImage)
    //     return (
    //       <figure>
    //         <Image src={vaultImage.default} alt={alt || text || ''} />
    //         <figcaption>{text}</figcaption>
    //       </figure>
    //     )
    //   }
    // }
    return (
      <figure>
        <img src={src.src} alt={alt || text || ''} />
        <figcaption>{text}</figcaption>
      </figure>
    )
  }
}
