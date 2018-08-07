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

export function getFlattenedOptions() {
  // currently, options is stored in flat format, so conversion is not required
  return getStoredOptions();
}

export async function setFlattenedOptions(options) {
  const optionsState = getStoredOptions();
  return setStoredOptions(Object.assign(optionsState, options));
}
