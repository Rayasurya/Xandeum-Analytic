export function formatDuration(duration: number | string): string {
  if (typeof duration === "string") {
    duration = parseFloat(duration);
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);
  const milliseconds = Math.floor((duration % 1) * 1000);
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  let result = `${pad(minutes, 2)}:${pad(seconds, 2)}`;

  if (milliseconds > 0) {
    result = `${result}.${milliseconds}`;
  }

  if (hours > 0) {
    result = `${pad(hours, 2)}:${result}`;
  }

  return result;
}
