export function countWords(text: string) {
    if (!text) return 0; // If no text is provided, return 0
    const words = text.trim().split(/\s+/); // Split by any whitespace (spaces, tabs, newlines)
    return words.length;
  }