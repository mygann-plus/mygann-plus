import storage from '~/utils/storage';
import { MODULE_MAP } from '~/module-map';

const SCHEMA_VERSION = 1;
const OPTIONS_STORAGE_KEY = 'options';

async function getStoredOptions() {
  return (await storage.get(OPTIONS_STORAGE_KEY, SCHEMA_VERSION)) || {};
}
function setStoredOptions(options) {
  return storage.set(OPTIONS_STORAGE_KEY, options, SCHEMA_VERSION);
}

export async function getOptionsFor(guid) {
  const options = await getStoredOptions();
  return options[guid];
}

export async function setOptionsFor(guid, options) {
  const optionsState = await getStoredOptions();
  optionsState[guid] = options;
  await setStoredOptions(optionsState);
}

export async function getFlattenedOptions() {
  // currently, options is stored in flat format, so conversion is not required
  const options = await getStoredOptions();
  Object.setPrototypeOf(options, null); // use as map
  return options;
}

export async function setFlattenedOptions(options) {
  return setStoredOptions(options);
}

export function mergeDefaultOptions(options) {
  for (const section in MODULE_MAP) {
    for (const module of MODULE_MAP[section]) {
      const { guid } = module;

      options[guid] = {
        enabled: module.config.defaultEnabled,
        options: {},
        ...options[guid],
      };

      const newSuboptions = {};
      for (const subopt in module.config.options) {
        // suboption doesn't exist
        if (!(subopt in options[guid].options)) {
          const { defaultValue } = module.config.options[subopt];
          newSuboptions[subopt] = defaultValue;
        } else {
          newSuboptions[subopt] = options[guid].options[subopt];
        }
      }
      options[guid].options = newSuboptions;
    }
  }
  return options;
}
