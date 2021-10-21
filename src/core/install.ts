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
  latestVersion: string; // the latest version MyGann+ knows so it knows if it has updated
}

function migrate(oldSchemaVersion: number, oldState: string) {
  return {
    installState: oldState,
  };
}

// in general it is better to use methods like hasUpdated since they are easier and automatically update the data
export async function getInstallData(): Promise<InstallState> {
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

export async function firstInstall(currentVersion: string) {
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString()}`;
  return storage.set(INSTALL_KEY, {
    installTimestamp: timestamp,
    installState: installStates.INSTALL,
    latestVersion: currentVersion,
  }, SCHEMA_VERSION);
}
export async function getInstallTimestamp() {
  const data = await getInstallData();
  return data.installTimestamp;
}
// eslint-disable-next-line max-len
export async function setLatestVersion(latestVersion: string, update: boolean, data: InstallState = null) {
  data = data ?? await getInstallData();
  const installState = update ? installStates.UPDATE : data.installState;
  return storage.set(INSTALL_KEY, {
    installTimestamp: data.installTimestamp,
    latestVersion,
    installState,
  }, SCHEMA_VERSION);
}
