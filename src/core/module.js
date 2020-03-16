const GUID_MAP = Object.create(null); // use as map

export default function registerModule(guid, module) {

  const defaultConfig = {
    showInOptions: true, // used for enabler modules
    description: '',
    defaultEnabled: true,
    affectsGlobalState: !!module.init, // modules with init fn are assumed to be global
    suboptions: [],
    topLevelOption: false,
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

  const moduleData = {
    guid,
    init,
    main,
    unload,
    config,
    __proto__: null,
  };
  GUID_MAP[guid] = moduleData;
  return moduleData;
}

export function getRegisteredModules() {
  return { ...GUID_MAP };
}
