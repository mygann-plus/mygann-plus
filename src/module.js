export default function registerModule(guid, module) {

  const defaultConfig = {
    showInOptions: true, // used for enabler modules
    description: '',
    defaultEnabled: true,
    affectsGlobalState: !!module.init, // modules with init fn are assumed to be global
    suboptions: [],
    __proto__: null, // use as map
  };

  const {
    init, main, unload, ...rest
  } = module;
  const config = { ...defaultConfig, ...rest };

  if (!guid) {
    throw new Error('Module must be created with GUID');
  }
  if (!config.name.trim()) {
    throw new Error('Module must be created with name');
  }
  if (!main && !init) {
    throw new Error('Module must be created with function');
  }

  return {
    guid,
    init,
    main,
    unload,
    config,
    __proto__: null,
  };
}
