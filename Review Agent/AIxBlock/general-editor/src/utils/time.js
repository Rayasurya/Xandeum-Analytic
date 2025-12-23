export function formatTimespan(secs) {
  const totalMinutes = Math.floor(secs / 60);
  const seconds = Number(secs % 60, 2).toFixed(2);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (hours > 0 ? (hours < 10 ? "0" + hours : hours) + ":" : "")
    + (minutes < 10 ? "0" + minutes : minutes)
    + ":" + (seconds < 10 ? "0" + seconds : seconds);
}