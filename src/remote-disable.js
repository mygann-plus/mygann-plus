import storage from '~/utils/storage';
import { fetchRawData } from '~/utils/fetch';
import getManifest from '~/utils/manifest';

// storage data
const REMOTE_DISABLE_STORAGE_SCHEMA_VERSION = 1;
const REMOTE_DISABLE_STORAGE_KEY = 'remote_disable';

// server data
const REMOTE_DISABLE_PATH = '/remote-disable/remote-disable.json'; // eslint-disable-line max-len

export async function fetchRemoteDisabled() {
  const data = await fetchRawData(REMOTE_DISABLE_PATH);
  const { disabled } = data;
  storage.set(REMOTE_DISABLE_STORAGE_KEY, disabled, REMOTE_DISABLE_STORAGE_SCHEMA_VERSION);
}

export async function isRemoteDisabled(module) {
  const version = getManifest().version_name;
  const storedDisabled = await storage.get(
    REMOTE_DISABLE_STORAGE_KEY,
    REMOTE_DISABLE_STORAGE_SCHEMA_VERSION,
  );
  if (!storedDisabled) {
    return false;
  }
  const disabledModule = storedDisabled.find(m => m.guid === module.guid);
  return disabledModule && disabledModule.version === version;
}
