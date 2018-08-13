import storage from '~/utils/storage';

const UPDATED_KEY = 'updated';
const SCHEMA_VERSION = 1;

export function markUpdated() {
  storage.set(UPDATED_KEY, true, SCHEMA_VERSION);
}
export async function hasUpdated() {
  const updated = await storage.get(UPDATED_KEY, SCHEMA_VERSION);
  return !!updated;
}
export function clearUpdate() {
  storage.set(UPDATED_KEY, false, SCHEMA_VERSION);
}
export function addUpdateChangeListener(listener) {
  return storage.addChangeListener(UPDATED_KEY, listener);
}
