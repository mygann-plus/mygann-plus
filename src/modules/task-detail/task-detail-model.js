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

export async function addOrChangeTaskDetail(id, newTaskDetail) {
  storage.addOrChangeArrayItem(TASK_DETAIL_KEY, id, () => newTaskDetail, SCHEMA_VERSION);
}

export async function getTaskDetail(id) {
  const details = (await getSavedTaskDetails()).find(f => f.id === id);
  // details will be null if page is accessed via checkpoints
  return details || { id, details: '' };
}
