import storage from '~/utils/storage';

const INSTALL_KEY = 'install';
const SCHEMA_VERSION = 1;

export const installStates = {
  INSTALL: 'install',
  UPDATE: 'update',
  PATCH: 'patch', // patch is currently unused, but still set
};

export function markInstallState(state) {
  return storage.set(INSTALL_KEY, state, SCHEMA_VERSION);
}
export async function hasInstalled() {
  const installState = await storage.get(INSTALL_KEY, SCHEMA_VERSION);
  return installState === installStates.INSTALL;
}
export async function hasUpdated() {
  const installState = await storage.get(INSTALL_KEY, SCHEMA_VERSION);
  return installState === installStates.UPDATE;
}
export function clearInstallState() {
  return markInstallState('');
}
export function addInstallStateChangeListener(listener) {
  return storage.addChangeListener(INSTALL_KEY, listener);
}
