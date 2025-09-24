import BlogExcerpt from './BlogExcerpt.jsx'

export default function BlogExcerpts({ posts }) {
  return (
    <div className="blog-excerpts">
      {posts.map((post) => (
        <BlogExcerpt post={post} key={post.data.permalink} />
      ))}
    </div>
  )
}
