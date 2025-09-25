import { getVaultImage } from '../lib/images.ts'

export default async function TopicCard({ topic }) {
  const titleSizeClass = `title-size-${parseInt(topic.data.title.length / 12)}`

  if (topic.data.images.length > 0) {
    const image = await getVaultImage(topic.data.images[0].src)
    if (image) {
      const src = (await image()).default
      console.log('TopicCard Image src:', src)
      return (
        <a href={topic.data.permalink} className="topic-card">
          <img
            src={src.src}
            alt={topic.data.images[0].alt || topic.data.title}
          />
          <span className={`title ${titleSizeClass}`}>{topic.data.title}</span>
        </a>
      )
    }
  }
  return (
    <a href={topic.data.permalink} className="topic-card">
      {topic.data.images.length > 0 && (
        <img
          src={topic.data.images[0].src}
          alt={topic.data.images[0].alt || topic.data.title}
        />
      )}
      <span className={`title ${titleSizeClass}`}>{topic.data.title}</span>
    </a>
  )
}
