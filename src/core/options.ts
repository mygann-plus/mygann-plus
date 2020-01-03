import { getRegisteredModules } from '~/core/module';
import storage from '~/utils/storage';

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
  const GUID_MAP = getRegisteredModules();
  const newOptions = {};

  for (const guid in GUID_MAP) {
    const module = GUID_MAP[guid];

    newOptions[guid] = {
      enabled: module.config.defaultEnabled,
      suboptions: {},
      ...options[guid],
    };

    const newSuboptions = {};
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

export function addOptionsChangeListener(listener) {
  storage.addChangeListener(OPTIONS_STORAGE_KEY, listener);
}
