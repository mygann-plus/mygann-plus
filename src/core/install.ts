import storage, { StorageChangeListener } from '~/utils/storage';

const INSTALL_KEY = 'install';
const SCHEMA_VERSION = 2;

export const installStates = {
  INSTALL: 'install',
  UPDATE: 'update',
  PATCH: 'patch', // patch is currently unused, but still set
};

/*
 * SCHEMA V2
 * installState,
 * installTimestamp: DateTimeString
*/

interface InstallState {
  installState: string;
  installTimestamp: string; // DateTime String
}

function migrate(oldSchemaVersion: number, oldState: string) {
  return {
    installState: oldState,
  };
}

async function getInstallData() {
  const data = await storage.get(INSTALL_KEY, SCHEMA_VERSION, migrate);
  return data || {};
}

export async function markInstallState(state: string) {
  const data = await getInstallData();
  return storage.set(INSTALL_KEY, { ...data, installState: state }, SCHEMA_VERSION);
}
export async function hasInstalled() {
  const data = await getInstallData();
  return data.installState === installStates.INSTALL;
}
export async function hasUpdated() {
  const data = await getInstallData();
  return data.installState === installStates.UPDATE;
}
export function clearInstallState() {
  return markInstallState('');
}
export function addInstallStateChangeListener(listener: StorageChangeListener<string>) {
  return storage.addChangeListener<InstallState>(INSTALL_KEY, data => {
    listener({
      oldValue: data.oldValue.installState,
      newValue: data.newValue.installState,
    });
  });
}

export async function markInstallTimestamp(timestamp: string) {
  const data = await getInstallData();
  return storage.set(INSTALL_KEY, { ...data, installTimestamp: timestamp }, SCHEMA_VERSION);
}
export async function getInstallTimestamp() {
  const data = await getInstallData();
  return data.installTimestamp;
}
