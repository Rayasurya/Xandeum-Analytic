export function openNewTab(url: string) {
  Object.assign(document.createElement('a'), {
      target: '_blank',
      rel: 'noopener noreferrer',
      href: url,
    }).click();
}
