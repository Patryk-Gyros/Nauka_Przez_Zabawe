function cleanJsonFromAI(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Brak tekstu do parsowania JSON");
  }

  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("Nie znaleziono tablicy JSON w odpowiedzi AI");
  }

  const jsonString = cleaned.substring(start, end + 1);

  return JSON.parse(jsonString);
}

module.exports = cleanJsonFromAI;