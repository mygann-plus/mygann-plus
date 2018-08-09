export default function fuzzyMatch(query, text) {
  const queryParts = query.toLowerCase().split(/\s+/);
  const textParts = text.toLowerCase().split(/\s+/);
  for (const queryPart of queryParts) {
    if (textParts.some(textPart => textPart.includes(queryPart))) {
      return true;
    }
  }
  return false;
}
