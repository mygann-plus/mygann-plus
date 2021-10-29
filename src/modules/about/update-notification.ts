import storage from '~/utils/storage';

const SHOW_NOTIFICATION_KEY = 'show_update_notification';
const SCHEMA_VERSION = 1;

/*
10/28/2021
I am removing the ability to opt out of notification dot.
This is because I am evil and everyone should see all our (and probably your) beautiful changes, all the time
*/

// export async function shouldShowNotification() {
//   const shouldShow = await storage.get(SHOW_NOTIFICATION_KEY, SCHEMA_VERSION);
//   return shouldShow !== false;
// }
// export function disableNotification() {
//   return storage.set(SHOW_NOTIFICATION_KEY, false, SCHEMA_VERSION);
// }

// storage.delete(SHOW_NOTIFICATION_KEY); // won't be needing this anymore but I'm not confident enough to uncomment but also i dont even think this file runs anything anymore
