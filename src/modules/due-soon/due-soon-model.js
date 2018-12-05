import storage from '~/utils/storage';

const DUE_SOON_KEY = 'due_soon';
const SCHEMA_VERSION = 1;

export async function getIsFiltered() {
  const data = await storage.get(DUE_SOON_KEY, SCHEMA_VERSION);
  return data && data.isFiltered;
}

export function setIsFiltered(isFiltered) {
  return storage.set(DUE_SOON_KEY, { isFiltered }, SCHEMA_VERSION);
}
