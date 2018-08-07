import storage, { deleteItem, changeItem, addItem } from '~/utils/storage';

const SCHEMA_VERSION = 1;

let favoritesData = null;

export async function getSavedFavorites() {
  if (!favoritesData) {
    favoritesData = (await storage.get('favorites', SCHEMA_VERSION)) || [];
  }
  return favoritesData;
}

export async function saveNewFavorite(favorite) {
  addItem('favorites', favorite, SCHEMA_VERSION);
}

export async function deleteSavedFavorite(id) {
  deleteItem('favorites', id, SCHEMA_VERSION);
}

export async function editSavedFavorite(id, newFavorite) {
  changeItem('favorites', id, () => newFavorite, SCHEMA_VERSION);
}

export async function getFavorite(id) {
  return (await getSavedFavorites()).find(f => f.id === id);
}
