import { excerpt, removeMarkup } from '../lib/text-utils.ts'
export default function BlogExcerpt({ post, maxLength = 200 }) {
  return (
    <div className="blog-excerpt">
      <h3>
        <a href={post.data.permalink}>
          {post.data.published.getUTCFullYear()} /{' '}
          {(post.data.published.getUTCMonth() + 1).toString().padStart(2, '0')}{' '}
          / {post.data.published.getUTCDate().toString().padStart(2, '0')} -{' '}
          {post.data.title}
        </a>
      </h3>
      <p>
        {excerpt(removeMarkup(post.body), maxLength)} (
        <a href={post.data.permalink}>read full post</a>)
      </p>
    </div>
  )
}
