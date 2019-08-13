import storage from '~/utils/storage';
import { fetchJson } from './utils/fetch';


// storage data
const REMOTE_DISABLE_STORAGE_SCHEMA_VERSION = 1;
const REMOTE_DISABLE_STORAGE_KEY = 'remote_disable';

// server data
const REMOTE_DISABLE_URL = 'https://mygannplus-data.surge.sh/remote-disable/remote-disable.json'; // eslint-disable-line max-len
const REMOTE_DISABLE_DATA_SCHEMA_VERSION = 1;

export async function fetchRemoteDisabled() {
  const data = await fetchJson(REMOTE_DISABLE_URL);
  if (data.$schemaVersion === REMOTE_DISABLE_DATA_SCHEMA_VERSION) {
    const { disabled } = data;
    storage.set(REMOTE_DISABLE_STORAGE_KEY, disabled, REMOTE_DISABLE_STORAGE_SCHEMA_VERSION);
  }
}

export async function isRemoteDisabled(module) {
  const storedDisabled = await storage.get(
    REMOTE_DISABLE_STORAGE_KEY,
    REMOTE_DISABLE_STORAGE_SCHEMA_VERSION,
  );
  if (!storedDisabled) {
    return false;
  }
  return storedDisabled.includes(module.guid);
}
