/** カタログ内の URL を組み立てる。リンク先はここを経由して指定する */
export const catalogPaths = {
  list: () => '/',
  detail: (slug: string) => `/components/${slug}`,
} as const
