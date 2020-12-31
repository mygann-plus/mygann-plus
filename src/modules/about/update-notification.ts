/*
Move idea to install.ts
export async function shouldShowNotification() {
  return localStorage.getItem('MyGannPlusUpdated') === 'true';
}

export function disableNotification() {
  localStorage.setItem('MyGannPlusUpdated', 'false');
}
*/
import storage from '~/utils/storage';

const SHOW_NOTIFICATION_KEY = 'show_update_notification';
const SCHEMA_VERSION = 1;

export async function shouldShowNotification() {
  const shouldShow = await storage.get(SHOW_NOTIFICATION_KEY, SCHEMA_VERSION);
  return shouldShow !== false;
}

export function disableNotification() {
  return storage.set(SHOW_NOTIFICATION_KEY, false, SCHEMA_VERSION);
}