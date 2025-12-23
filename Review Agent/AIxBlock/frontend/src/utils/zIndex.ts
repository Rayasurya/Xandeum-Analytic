export function highestZIndex() {
  return Array.from(document.querySelectorAll('body *'))
    .filter(e => !e.classList.contains("Toastify__toast-container") && !e.classList.contains("Toastify__toast"))
    .map(a => parseFloat(window.getComputedStyle(a).zIndex))
    .filter(a => a < 2000000000)
    .filter(a => !isNaN(a))
    .sort((a, b) => a - b)
    .pop() ?? 0;
}
