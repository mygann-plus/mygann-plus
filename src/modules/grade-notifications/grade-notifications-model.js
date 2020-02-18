import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const GRADE_NOTIFICATIONS_KEY = 'graded_notifications';

/**
SCHEMA v1
{
  lastChecked: '1/1/2018',
  cleared: [id, id, id]
}

*/

async function getLastCheckedData() {
  return (await storage.get(GRADE_NOTIFICATIONS_KEY, SCHEMA_VERSION)) || {};
}

export async function setLastChecked(dateTimeString) {
  return storage.set(GRADE_NOTIFICATIONS_KEY, {
    lastChecked: dateTimeString,
    cleared: [], // when lastChecked is set, cleared is reset
  }, SCHEMA_VERSION);
}

export async function getLastChecked() {
  const { lastChecked } = await getLastCheckedData();
  if (!lastChecked) {
    const today = new Date();
    const todayDateTime = `${today.toLocaleDateString('en-US')} ${today.toLocaleTimeString()}`;
    await setLastChecked(todayDateTime);
    return today;
  }
  return lastChecked;
}

export async function getClearedNotifications() {
  const { cleared } = await getLastCheckedData();
  return cleared || [];
}

export async function addClearedNotification(assignmentId) {
  const data = await getLastCheckedData();
  return storage.set(GRADE_NOTIFICATIONS_KEY, {
    ...data,
    cleared: [
      ...(data.cleared || []),
      assignmentId,
    ],
  }, SCHEMA_VERSION);
}
