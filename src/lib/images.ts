import type { ImageMetadata } from 'astro';

const allVaultImages = import.meta.glob(
  '../../content/obsidian-vault/**/*.{jpeg,jpg,png,gif}'
);

console.log('All vault images:', Object.keys(allVaultImages));

export async function getVaultImage(path: string): Promise<{ default: ImageMetadata } | null> {
  for (const [key, resolver] of Object.entries(allVaultImages)) {
    if (key.endsWith(path) || key.endsWith(decodeURIComponent(path))) {
      return resolver as unknown as { default: ImageMetadata };
    }
  }
  return null;
}
