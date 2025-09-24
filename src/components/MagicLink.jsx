import TopicCard from './TopicCard.jsx'
import { parseLinkTextMicroformat } from '../lib/microformats.ts'
import { getFileFromPermalink } from '../lib/permalink-map.ts'

export default function MagicLink({ href, children, className }) {
  // We can do special work here by reading/manipulating the children.props.value
  // which is the display text for the obsidian wiki link.
  const topic = getFileFromPermalink(href)

  const { text, directives } = parseLinkTextMicroformat(
    children?.props?.value?.toString(),
  )

  if (
    text.trim() === '' ||
    (text.trim() === href && text.trim().startsWith('/'))
  ) {
    return (
      <a href={href} className={`magic-link ${className}`}>
        {children}
        {topic.data.title}
      </a>
    )
  }

  if (directives.includes('topic-card')) {
    if (topic) {
      // If we found a topic, we can use its data to render a special link
      return <TopicCard topic={topic} />
    }
  }
  return (
    <a href={href} className={`magic-link ${className}`}>
      {children}
    </a>
  )
}
