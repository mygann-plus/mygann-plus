const GUID_MAP = Object.create(null); // use as map

interface ModuleFunctions {
  init?: Function,
  main?: Function,
  unload?: Function,
}

interface ModuleConfig extends ModuleFunctions {
  name: string,
  description?: string,
  showInOptions?: boolean,
  defaultEnabled?: boolean,
  affectsGlobalState?: boolean,
  suboptions?: Suboption[],
}

interface Suboption {

}

export interface Module extends ModuleFunctions {
  guid: string,
  config: Exclude<ModuleConfig, 'init' | 'main' | 'unload'>
}

export default function registerModule(guid: string, module: ModuleConfig): Module {

  const defaultConfig: any = {
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

  const moduleData: Module = {
    guid,
    init,
    main,
    unload,
    config,
  };
  GUID_MAP[guid] = moduleData;
  return moduleData;
}

export function getRegisteredModules() {
  return { ...GUID_MAP };
}
