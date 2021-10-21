import {
  installStates,
  firstInstall,
  getInstallData,
  setLatestVersion,
} from '~/core/install';
import manifest from '~/utils/manifest';

function isPatch(prevVersion: string, curVersion: string) {
  if (prevVersion === null) return false;
  const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
  const [curMajor, curMinor, curPatch] = curVersion.split('.');
  return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
}

// chrome.runtime.onInstalled.addListener(async ({ previousVersion, reason }) => {
//   if (reason === 'update') {
//     const currentVersion = chrome.runtime.getManifest().version;
//     const isUpdate = !isPatch(previousVersion, currentVersion);
//     markInstallState(isUpdate ? installStates.UPDATE : installStates.PATCH);
//   } else {
//     const now = new Date();
//     const timestamp = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString()}`;
//     await markInstallState(installStates.INSTALL);
//     markInstallTimestamp(timestamp);
//   }
// });

export default async function checkForUpdates() {
  const data = await getInstallData();
  if (!data.installTimestamp) { // it has never been installed
    firstInstall(manifest.version_name);
  } else if (!data.latestVersion) { // after everyone has definately gotten the latestVersion property this can be used to check install
    setLatestVersion(manifest.version_name, false, data);
  } else if (data.installState !== installStates.UPDATE
             && data.installState !== installStates.INSTALL) { // if it was already marked updated this is unnecessary
    const oldVersion = data.latestVersion;
    const newVersion = manifest.version_name;
    if (newVersion !== oldVersion) {
      const isUpdate = !isPatch(oldVersion, newVersion);
      setLatestVersion(newVersion, isUpdate, data);
    } // if oldVersion === newVersion nothing is needed since state will be cleared while setting oldVersion
  }
}
