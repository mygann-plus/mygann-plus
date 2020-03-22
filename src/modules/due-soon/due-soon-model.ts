import storage from '~/utils/storage';

const DUE_SOON_KEY = 'due_soon';
const SCHEMA_VERSION = 1;

export async function getIsFiltered(): Promise<boolean> {
  const data = await storage.get(DUE_SOON_KEY, SCHEMA_VERSION);
  return data && data.isFiltered;
}

export function setIsFiltered(isFiltered: boolean) {
  return storage.set(DUE_SOON_KEY, { isFiltered }, SCHEMA_VERSION);
}
