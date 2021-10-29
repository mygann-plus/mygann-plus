import manifest from '~/utils/manifest';
import storage, { StorageChangeListener } from '~/utils/storage';

const INSTALL_KEY = 'install';
const SCHEMA_VERSION = 2;

const PREVIOUS_VERSION_KEY = 'lastSeen';
const PREVIOUS_VERSION_SCHEMA = 1;

async function getPreviousVersion() {
  return await storage.get(PREVIOUS_VERSION_KEY, PREVIOUS_VERSION_SCHEMA) || '1.16.0';
}

function setPreviousVersion(version: string) {
  return storage.set(PREVIOUS_VERSION_KEY, version, PREVIOUS_VERSION_SCHEMA);
}

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

function isPatch(prevVersion: string, curVersion: string) {
  const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
  const [curMajor, curMinor, curPatch] = curVersion.split('.');
  return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
}

async function checkForUpdates() {
  const previousVersion = await getPreviousVersion();
  const currentVersion = manifest.version_name;
  if (previousVersion !== currentVersion) {
    if (!await hasUpdated() && !await hasInstalled()) {
      const isUpdate = !isPatch(previousVersion, currentVersion);
      await markInstallState(isUpdate ? installStates.UPDATE : installStates.PATCH);
    }
    setPreviousVersion(currentVersion);
  }
}

checkForUpdates();
