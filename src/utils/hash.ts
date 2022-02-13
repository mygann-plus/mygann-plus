export default function getHash(url?: string) {
  return new URL(url || window.location.href).hash || '#';
}
