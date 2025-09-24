import { getCollection } from 'astro:content'

const permalinkDataMapFile = (await getCollection('data')).find(
  (f) => f.data.slug === 'permalink-data-map',
)!

export function getFileFromPermalink(permalink: string) {
  return permalinkDataMapFile.data.files[permalink]
}