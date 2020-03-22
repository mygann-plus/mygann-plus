import { UnloaderContext } from '~/core/module-loader'; // eslint-disable-line import/no-cycle

const GUID_MAP = Object.create(null); // use as map

interface ModuleFunctions {
  init?: (opts?: any, unloaderContext?: UnloaderContext) => void;
  main?: (opts?: any, unloaderContext?: UnloaderContext) => void;
  unload?: (opts?: any) => void;
}

interface ModuleConfig extends ModuleFunctions {
  name: string;
  description?: string;
  showInOptions?: boolean;
  defaultEnabled?: boolean;
  affectsGlobalState?: boolean;
  suboptions?: Suboptions;
  topLevelOption?: boolean;
  affectsGlobal?: boolean;
}

interface SuboptionValidatorData {
  valid: boolean;
  message?: string
}
type SuboptionValidatorReturn = SuboptionValidatorData | boolean;
type SuboptionValidatorFunction = (value: any) => (
  SuboptionValidatorReturn | Promise<SuboptionValidatorReturn>
)

interface BaseSuboption<TypeName, DefaultValue> {
  name: string;
  type: TypeName;
  defaultValue: DefaultValue;
  description?: string;
  htmlDescription?: boolean;
  dependent?: string;
  resettable?: boolean;
  validator?: SuboptionValidatorFunction;
}

type StringSuboption = BaseSuboption<'string', string>;
type BooleanSuboption = BaseSuboption<'boolean', boolean>;
type ColorSuboption = BaseSuboption<'color', string>;
type TextareaSuboption = BaseSuboption<'textarea', string>;
type EmailSuboption = BaseSuboption<'email', string>;
type PasswordSuboption = BaseSuboption<'password', string>;

interface NumberSuboption extends BaseSuboption<'number', number> {
  min?: number;
  max?: number;
}

interface EnumSuboption extends BaseSuboption<'enum', string> {
  enumValues: {
    [key: string]: string;
  }
}

interface ComboSuboption extends BaseSuboption<'combo', string> {
  presetValues: string[];
}


export type Suboption = (
  StringSuboption | BooleanSuboption |
  NumberSuboption | EnumSuboption |
  ComboSuboption | ColorSuboption |
  TextareaSuboption | EmailSuboption |
  PasswordSuboption
)

type Suboptions = {
  [key: string]: Suboption;
}

export interface Module extends ModuleFunctions {
  guid: string,
  config: Exclude<ModuleConfig, 'init' | 'main' | 'unload'>
}


export default function registerModule(guid: string, moduleConfig: ModuleConfig): Module {

  const defaultConfig: ModuleConfig = {
    name: '',
    showInOptions: true, // used for enabler modules
    description: '',
    defaultEnabled: true,
    affectsGlobalState: !!moduleConfig.init, // modules with init fn are assumed to be global
    suboptions: {},
    topLevelOption: false,
  };

  const {
    init, main, unload, ...rest
  } = moduleConfig;
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
  };
  GUID_MAP[guid] = moduleData;
  return moduleData;
}

export function getRegisteredModules() {
  return { ...GUID_MAP };
}
