import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const FAVORITES_KEY = 'favorites';

export function getSavedFavorites() {
  return storage.getArray(FAVORITES_KEY, SCHEMA_VERSION);
}

export async function saveNewFavorite(favorite) {
  return storage.addArrayItem(FAVORITES_KEY, favorite, SCHEMA_VERSION);
}

export async function deleteSavedFavorite(id) {
  storage.deleteArrayItem(FAVORITES_KEY, id, SCHEMA_VERSION);
}

export async function editSavedFavorite(id, newFavorite) {
  storage.changeArrayItem(FAVORITES_KEY, id, () => newFavorite, SCHEMA_VERSION);
}

export async function getFavorite(id) {
  return (await getSavedFavorites()).find(f => f.id === id);
}

export function addFavoritesChangeListener(callback) {
  return storage.addChangeListener(FAVORITES_KEY, callback);
}
