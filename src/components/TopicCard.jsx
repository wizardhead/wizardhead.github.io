export default function TopicCard({ topic }) {
  const titleSizeClass = `title-size-${parseInt(topic.data.title.length / 12)}`
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
