import { getFileFromPermalink } from '../lib/permalink-map.ts'

export default function PageNav({ previousPage, nextPage }) {
  const previousPageData = getFileFromPermalink(previousPage)?.data
  const nextPageData = getFileFromPermalink(nextPage)?.data
  return (
    (nextPage || previousPage) && (
      <section className="page-nav">
        {previousPageData && (
          <a className="previous-page" href={previousPage}>
            « Previous: {previousPageData.title}
          </a>
        )}
        {nextPageData && (
          <a className="next-page" href={nextPage}>
            Next: {nextPageData.title} »
          </a>
        )}
      </section>
    )
  )
}
