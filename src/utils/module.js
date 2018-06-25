export default function registerModule(name, fn, options = {}) {

  const defaultOptions = {
    showInOptions: true, // used for enabler modules
    description: '',
  };

  if (!name.trim()) {
    throw new Error('Module must be registered with name');
  }
  if (!fn) {
    throw new Error('Module must be registered with function');
  }

  return { name, fn, options: Object.assign(defaultOptions, options) };
}
