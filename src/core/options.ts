import { getRegisteredModules } from '~/core/module'; // eslint-disable-line import/no-cycle
import storage, { StorageChangeListener } from '~/utils/storage';

const SCHEMA_VERSION = 1;
const OPTIONS_STORAGE_KEY = 'options';

export interface ModuleOptions {
  enabled: boolean;
  suboptions: {
    [suboptionName: string]: any
  }
}

export interface AllOptions {
  [moduleId: string]: ModuleOptions;
}

async function getStoredOptions() {
  return (await storage.get(OPTIONS_STORAGE_KEY, SCHEMA_VERSION)) || {};
}
function setStoredOptions(options: AllOptions) {
  return storage.set(OPTIONS_STORAGE_KEY, options, SCHEMA_VERSION);
}

export async function getOptionsFor(guid: string): Promise<ModuleOptions> {
  const options = await getStoredOptions();
  return options[guid];
}

export async function setOptionsFor(guid: string, options: ModuleOptions) {
  const optionsState = await getStoredOptions();
  optionsState[guid] = options;
  await setStoredOptions(optionsState);
}

export async function getFlattenedOptions(): Promise<AllOptions> {
  // currently, options is stored in flat format, so conversion is not required
  const options = await getStoredOptions();
  Object.setPrototypeOf(options, null); // use as map
  return options;
}

export async function setFlattenedOptions(options: AllOptions) {
  return setStoredOptions(options);
}

export function mergeDefaultOptions(options: AllOptions) {
  const GUID_MAP = getRegisteredModules();
  const newOptions: AllOptions = {};

  for (const guid in GUID_MAP) {
    const module = GUID_MAP[guid];

    newOptions[guid] = {
      enabled: module.config.defaultEnabled,
      suboptions: {},
      ...options[guid],
    };

    const newSuboptions: any = {};
    for (const subopt in module.config.suboptions) {
      // suboption doesn't exist
      if (!(subopt in newOptions[guid].suboptions)) {
        const { defaultValue } = module.config.suboptions[subopt];
        newSuboptions[subopt] = defaultValue;
      } else {
        newSuboptions[subopt] = newOptions[guid].suboptions[subopt];
      }
    }
    newOptions[guid].suboptions = newSuboptions;
  }
  return newOptions;
}

export function addOptionsChangeListener(listener: StorageChangeListener<AllOptions>) {
  storage.addChangeListener<AllOptions>(OPTIONS_STORAGE_KEY, listener);
}
