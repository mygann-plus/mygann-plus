import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const GRADE_NOTIFICATIONS_KEY = 'graded_notifications';

/**
SCHEMA v1
{
  lastChecked: '1/1/2018'
}

*/

export async function setLastChecked(dateTimeString) {
  return storage.set(GRADE_NOTIFICATIONS_KEY, { lastChecked: dateTimeString }, SCHEMA_VERSION);
}

export async function getLastChecked() {
  const { lastChecked } = (await storage.get(GRADE_NOTIFICATIONS_KEY, SCHEMA_VERSION)) || {};
  if (!lastChecked) {
    const today = new Date();
    const todayDateTime = `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
    await setLastChecked(todayDateTime);
    return today;
  }
  return lastChecked;
}
