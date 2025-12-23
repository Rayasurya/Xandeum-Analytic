export const generateRandomText = (length: number): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const prefix = 'org_...';
  let result = '';

  for (let i = 0; i < length; i++) {
    if (i < prefix.length) {
      result += prefix[i];
    } else {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
  }

  return result;
};
