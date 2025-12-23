export function convertHtmlToText(html: string): string {
  const ele = document.createElement("DIV");
  ele.innerHTML = html;
  return ele.innerText;
}
