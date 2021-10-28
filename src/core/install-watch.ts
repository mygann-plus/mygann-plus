import { markInstallState, installStates, markInstallTimestamp } from '~/core/install';
// if instant update has to be reverted, uncomment the comments and remove checkForUpdates and isPatch from install.ts

// function isPatch(prevVersion: string, curVersion: string) {
//   const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
//   const [curMajor, curMinor, curPatch] = curVersion.split('.');
//   return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
// }

chrome.runtime.onInstalled.addListener(async ({ previousVersion, reason }) => {
  console.log('at least');
  if (reason === 'update') {
    // const currentVersion = chrome.runtime.getManifest().version;
    // const isUpdate = !isPatch(previousVersion, currentVersion);
    // markInstallState(isUpdate ? installStates.UPDATE : installStates.PATCH);
  } else if (reason === 'install') {
    console.log('here', reason);
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString()}`;
    await markInstallState(installStates.INSTALL);
    markInstallTimestamp(timestamp);
  }
});
