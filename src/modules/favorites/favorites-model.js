import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;

let favoritesData = null;

export async function getSavedFavorites() {
  if (!favoritesData) {
    favoritesData = await storage.getArray('favorites', SCHEMA_VERSION);
  }
  return favoritesData;
}

export async function saveNewFavorite(favorite) {
  return storage.addArrayItem('favorites', favorite, SCHEMA_VERSION);
}

export async function deleteSavedFavorite(id) {
  storage.deleteArrayItem('favorites', id, SCHEMA_VERSION);
}

export async function editSavedFavorite(id, newFavorite) {
  storage.changeArrayItem('favorites', id, () => newFavorite, SCHEMA_VERSION);
}

export async function getFavorite(id) {
  return (await getSavedFavorites()).find(f => f.id === id);
}
