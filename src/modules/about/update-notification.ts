export async function shouldShowNotification() {
  return localStorage.getItem('MyGannPlusUpdated') === 'true';
}

export function disableNotification() {
  localStorage.setItem('MyGannPlusUpdated', 'false');
}