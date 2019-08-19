import storage from '~/utils/storage';

const HIDE_COMPLETED_KEY = 'hide_completed';
const SCHEMA_VERSION = 1;

export async function getHideCompletedEnabled() {
  const data = await storage.get(HIDE_COMPLETED_KEY, SCHEMA_VERSION);
  return data && data.enabled;
}

export function setHideCompletedEnabled(enabled) {
  return storage.set(HIDE_COMPLETED_KEY, { enabled }, SCHEMA_VERSION);
}
