export function getContrastColour(bg: string) {
  let r = parseInt(bg.substring(1, 3), 16);
  let g = parseInt(bg.substring(3, 5), 16);
  let b = parseInt(bg.substring(5, 7), 16);
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? "black" : "white";
}

export function colourFromString(str: string) {
  let hash = 0;

  str.split("").forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });

  let colour = "#";

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }

  return colour;
}
