export function nextName(list: string[], prefix: string) {
  let max = 0;

  for (let i = 0; i < list.length; i++) {
    if (list[i].startsWith(prefix)) {
      const number = parseInt(list[i].substring(prefix.length).trim());

      if (isNaN(number)) {
        continue;
      }

      max = Math.max(max, number);
    }
  }

  return prefix + " " + (max + 1);
}
