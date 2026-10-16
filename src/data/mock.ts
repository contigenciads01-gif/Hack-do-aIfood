export function pageHead(title: string, description: string, isPrivate: boolean = true) {
  const meta: Array<Record<string, string>> = [
    { title: `${title} — hack du ifood` },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} — hack du ifood` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];

  if (isPrivate) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' });
  }

  return { meta };
}
