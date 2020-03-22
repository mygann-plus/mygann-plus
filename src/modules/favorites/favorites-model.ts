import storage, { StorageChangeListener } from '~/utils/storage';

const SCHEMA_VERSION = 1;
const FAVORITES_KEY = 'favorites';

export interface Favorite {
  id: string;
  title: string;
  hash: string;
}

export function getSavedFavorites(): Promise<Favorite[]> {
  return storage.getArray(FAVORITES_KEY, SCHEMA_VERSION);
}

export async function saveNewFavorite(favorite: Favorite) {
  return storage.addArrayItem(FAVORITES_KEY, favorite, SCHEMA_VERSION);
}

export async function deleteSavedFavorite(id: string) {
  storage.deleteArrayItem(FAVORITES_KEY, id, SCHEMA_VERSION);
}

export async function editSavedFavorite(id: string, newFavorite: Favorite) {
  storage.changeArrayItem(FAVORITES_KEY, id, () => newFavorite, SCHEMA_VERSION);
}

export async function getFavorite(id: string) {
  return (await getSavedFavorites()).find(f => f.id === id);
}

export function addFavoritesChangeListener(callback: StorageChangeListener<Favorite[]>) {
  return storage.addChangeListener(FAVORITES_KEY, callback);
}
