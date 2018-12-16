import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const TASK_DETAIL_KEY = 'TASK_DETAILS';

/**
SCHEMA v1
{
  id,
  details: 'htmlTaskDetails'
}
*/

export function getSavedTaskDetails() {
  return storage.getArray(TASK_DETAIL_KEY, SCHEMA_VERSION);
}

export async function saveNewTaskDetail(task) {
  return storage.addArrayItem(TASK_DETAIL_KEY, task, SCHEMA_VERSION);
}
window.saveNewTaskDetail = saveNewTaskDetail;

export async function addOrChangeTaskDetail(id, newTaskDetail) {
  storage.addOrChangeArrayItem(TASK_DETAIL_KEY, id, () => newTaskDetail, SCHEMA_VERSION);
}

export async function getTaskDetail(id) {
  return (await getSavedTaskDetails()).find(f => f.id === id);
}

export function addFavoritesChangeListener(callback) {
  return storage.addChangeListener(TASK_DETAIL_KEY, callback);
}
