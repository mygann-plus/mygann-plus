export function sanitizeHTMLString(string) {
  return string.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}
