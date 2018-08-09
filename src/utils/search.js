function splitString(string) {
  return new Set(string.trim().toLowerCase().split(/\W+/));
}

export default function fuzzyMatch(query, text) {
  const queryParts = splitString(query);
  const textParts = splitString(text);
  const matchedQueryParts = new Set();

  for (const textPart of textParts) {
    for (const queryPart of queryParts) {
      if (textPart.startsWith(queryPart)) {
        matchedQueryParts.add(queryPart);
      }
    }
  }
  return matchedQueryParts.size === queryParts.size;
}
