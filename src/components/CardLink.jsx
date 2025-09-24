export default function CardLink({ topic }) {
  return (
    <div>
      <h6>Magic Card: {topic.data.title}</h6>
      <p>Tags: {topic.data.tags.join(', ')}</p>
    </div>
  )
}
