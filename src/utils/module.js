export default function registerModule(name, fn) {
  if (!name.trim()) {
    throw new Error('Module must be registered with name');
  }
  if (!fn) {
    throw new Error('Module must be registered with function');
  }
  return { name, fn };
}
