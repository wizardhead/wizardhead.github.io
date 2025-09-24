import { NORMALIZED_CONTENT_PATH } from './lib/consts.ts'
// Import the glob loader
import { glob } from 'astro/loaders'
// Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content'
// Define a `loader` and `schema` for each collection
const PageSchema = z.object({
  title: z.string(),
  published: z.date().optional(),
  slug: z.string(),
  permalink: z.string(),
  tags: z.array(z.string()),
  previous_page: z.string().optional(),
  next_page: z.string().optional(),
  youtube_video_id: z.string().optional(),
  images: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
  links: z
    .array(
      z.object({
        href: z.string(),
        text: z.string().optional(),
      }),
    )
    .optional(),

})

const blog = defineCollection({
  loader: glob({ pattern: 'Blog/**/[^_]*.mdx', base: NORMALIZED_CONTENT_PATH }),
  schema: PageSchema,
})
const topics = defineCollection({
  loader: glob({
    pattern: 'Topics/**/[^_]*.mdx',
    base: NORMALIZED_CONTENT_PATH,
  }),
  schema: PageSchema,
})
const data = defineCollection({
  loader: glob({
    pattern: 'Data/**/[^_]*.mdx',
    base: NORMALIZED_CONTENT_PATH,
  }),
})
// Export a single `collections` object to register your collection(s)
export const collections = { blog, topics, data }
