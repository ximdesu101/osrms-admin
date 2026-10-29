export { cn } from "cn";

/**
 * Capitalizes only the first letter of the entire string,
 * preserving leading whitespace and the rest of the text.
 * Used for Notes / sentence-style fields.
 * @param {string} str
 * @returns {string}
 */
export function capitalizeFirstLetter(str) {
  if (str == null || str === "") return str;
  const match = String(str).match(/^(\s*)([\s\S]*)$/);
  if (!match) return str;
  const [, spaces, rest] = match;
  if (!rest) return str;
  return spaces + rest.charAt(0).toUpperCase() + rest.slice(1);
}

/**
 * Capitalizes the first letter of every word (after whitespace).
 * Does not capitalize after punctuation (e.g. "john.doe" → "John.doe").
 * Used for name / title-style fields.
 * @param {string} str
 * @returns {string}
 */
export function capitalizeWords(str) {
  if (str == null || str === "") return str;
  return String(str).replace(/(^|\s)(\S)/g, (_, space, char) => space + char.toUpperCase());
}