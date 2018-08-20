import { markInstallState, installStates } from '~/install';

function isPatch(prevVersion, curVersion) {
  const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
  const [curMajor, curMinor, curPatch] = curVersion.split('.');
  return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
}

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
  if (reason === 'update') {
    const currentVersion = chrome.runtime.getManifest().version;
    const isUpdate = !isPatch(previousVersion, currentVersion);
    markInstallState(isUpdate ? installStates.UPDATE : installStates.PATCH);
  } else {
    markInstallState(installStates.INSTALL);
  }
});
