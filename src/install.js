import storage from '~/utils/storage';

const INSTALL_KEY = 'install';
const SCHEMA_VERSION = 1;

export function markInstallState(reason) {
  return storage.set(INSTALL_KEY, reason, SCHEMA_VERSION);
}
export async function hasInstalled() {
  const installState = await storage.get(INSTALL_KEY, SCHEMA_VERSION);
  return installState === 'install';
}
export async function hasUpdated() {
  const installState = await storage.get(INSTALL_KEY, SCHEMA_VERSION);
  return installState === 'update';
}
export function clearInstallState() {
  return markInstallState('');
}
export function addInstallStateChangeListener(listener) {
  return storage.addChangeListener(INSTALL_KEY, listener);
}
