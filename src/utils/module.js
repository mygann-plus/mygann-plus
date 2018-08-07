export default function createModule(guid, module) {

  const defaultConfig = {
    showInOptions: true, // used for enabler modules
    description: '',
    defaultEnabled: true,
    options: [],
    __proto__: null, // use as map
  };

  const { init, main, ...rest } = module;
  const config = { ...defaultConfig, ...rest };

  if (!guid) {
    throw new Error('Module must be created with GUID');
  }
  if (!config.name.trim()) {
    throw new Error('Module must be created with name');
  }
  if (!config.main && !config.init) {
    throw new Error('Module must be created with function');
  }

  return {
    guid,
    init,
    main,
    config,
    __proto__: null,
  };
}
