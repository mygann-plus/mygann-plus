import storage, { deleteItem, changeItem, addItem } from '~/utils/storage';

let favoritesData = null;

export async function getSavedFavorites() {
  if (!favoritesData) {
    favoritesData = (await storage.get('favorites')) || [];
  }
  return favoritesData;
}

export async function saveNewFavorite(favorite) {
  addItem('favorites', favorite);
}

export async function deleteSavedFavorite(id) {
  deleteItem('favorites', id);
}

export async function editSavedFavorite(id, newFavorite) {
  changeItem('favorites', id, () => newFavorite);
}

export async function getFavorite(id) {
  return (await getSavedFavorites()).find(f => f.id === id);
}
