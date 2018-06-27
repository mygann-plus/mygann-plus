/**
 *
 * @param {string} name Module name to be displayed in options
 * @param {function} fn Main function to be run
 * @param {object} config Extra configuration object
 */
export default function registerModule(name, fn, config = {}) {

  const defaultConfig = {
    showInOptions: true, // used for enabler modules
    description: '',
    options: [],
  };

  if (!name.trim()) {
    throw new Error('Module must be registered with name');
  }
  if (!fn) {
    throw new Error('Module must be registered with function');
  }

  return { name, fn, config: Object.assign(defaultConfig, config) };
}
