// import {
//   installStates,
//   firstInstall,
//   getInstallData,
//   setLatestVersion,
// } from '~/core/install';
// import manifest from '~/utils/manifest';

// function isPatch(prevVersion: string, curVersion: string) {
//   if (prevVersion === null) return false;
//   const [prevMajor, prevMinor, prevPatch] = prevVersion.split('.');
//   const [curMajor, curMinor, curPatch] = curVersion.split('.');
//   return prevMajor === curMajor && prevMinor === curMinor && prevPatch !== curPatch;
// }

// // chrome.runtime.onInstalled.addListener(async ({ previousVersion, reason }) => {
// //   if (reason === 'update') {
// //     const currentVersion = chrome.runtime.getManifest().version;
// //     const isUpdate = !isPatch(previousVersion, currentVersion);
// //     markInstallState(isUpdate ? installStates.UPDATE : installStates.PATCH);
// //   } else {
// //     const now = new Date();
// //     const timestamp = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString()}`;
// //     await markInstallState(installStates.INSTALL);
// //     markInstallTimestamp(timestamp);
// //   }
// // });

// // export default async function checkForUpdates() {
// //   const data = await getInstallData();
// //   if (!data.installTimestamp) { // it has never been installed. after everyone has definately gotten the latestVersion property that can be used to check install
// //     await firstInstall(manifest.version_name);
// //   } else if (
// //     !data.installState
// //     || data.installState === installStates.PATCH
// //     || !data.latestVersion
// //   ) { // if the install state is empty, patch, or if latestVersion hasn't been initialized. basically it is not already marked as updated or installed
// //     const oldVersion = data.latestVersion || '1.16.1'; // 1.16.1 is the update that latestVersion was added, so it should
// //     const newVersion = manifest.version_name;
// //     if (newVersion !== oldVersion) {
// //       const isUpdate = !isPatch(oldVersion, newVersion);
// //       await setLatestVersion(newVersion, isUpdate, data);
// //     } // if oldVersion === newVersion nothing is needed since state will be cleared while setting oldVersion
// //   }
// // }
