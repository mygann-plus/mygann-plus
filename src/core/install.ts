import storage, { StorageChangeListener } from '~/utils/storage';
import manifest from '~/utils/manifest';

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

function isPatch(prevVersion: string, curVersion: string) {
  if (prevVersion === null) return false;
  const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
  const [curMajor, curMinor, curPatch] = curVersion.split('.');
  return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
}

// in general it is better to use methods like hasUpdated since they are easier and automatically update the data
async function getInstallData(): Promise<InstallState> {
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

async function checkForUpdates() {
  const data = await getInstallData();
  if (!data.installTimestamp) { // it has never been installed. after everyone has definately gotten the latestVersion property that can be used to check install
    await firstInstall(manifest.version_name);
  } else if (
    !data.installState
    || data.installState === installStates.PATCH
    || !data.latestVersion
  ) { // if the install state is empty, patch, or if latestVersion hasn't been initialized. basically it is not already marked as updated or installed
    const oldVersion = data.latestVersion || '1.16.1'; // 1.16.1 is the update that latestVersion was added, so it should
    const newVersion = manifest.version_name;
    if (newVersion !== oldVersion) {
      const isUpdate = !isPatch(oldVersion, newVersion);
      // await setLatestVersion(newVersion, isUpdate, data);
      await storage.set(INSTALL_KEY, {
        installTimestamp: data.installTimestamp,
        latestVersion: newVersion,
        installState: isUpdate ? installStates.UPDATE : data.installState,
      }, SCHEMA_VERSION);
    } // if oldVersion === newVersion nothing is needed since state will be cleared while setting oldVersion
  }
}

