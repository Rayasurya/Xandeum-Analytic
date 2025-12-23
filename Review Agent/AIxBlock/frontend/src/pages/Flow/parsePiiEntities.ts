export type TParsedPiiEntities = {
  redactors: Element[];
}

export function parsePiiEntities(labelConfig: string): TParsedPiiEntities {
  const parser = new DOMParser();
  const doc = parser.parseFromString(labelConfig, "text/xml");
  let redactors = Array.from(doc.querySelectorAll("Redactor"));

  return {
    redactors,
  };
}
