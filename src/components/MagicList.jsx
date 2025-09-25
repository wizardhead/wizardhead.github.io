export default function MagicList({ children }) {
  if (children?.props?.value?.includes('class="topic-card"')) {
    // Let's do something insane and strip out all the <li> and return
    // a topic-grid full of topic-cards.
    const newChildrenHTML = children.props.value.replaceAll(/<\/?(li|p)>/g, '')
    return (
      <figure>
        <div
          className="topic-grid"
          dangerouslySetInnerHTML={{ __html: newChildrenHTML }}
        ></div>
      </figure>
    )
  }
  return <ul>{children}</ul>
}
