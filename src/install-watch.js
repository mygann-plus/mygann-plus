import { markInstallState } from '~/install';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  markInstallState(reason);
});
