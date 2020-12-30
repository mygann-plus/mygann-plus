// import { isBookmarklet } from '~/utils/bookmarklet';

// export default function getManifest() {
//   if (isBookmarklet()) {
//     return {
//       version_name: '1.14.0',
//       description: 'A collection of modules that improve your MyGann experience',
//     };
//   } else {
//     return chrome.runtime.getManifest();
//   }
// }

const manifest: chrome.runtime.Manifest = {
  version_name: '1.15.0',
  description: 'A collection of modules that improve your MyGann experience',
} as chrome.runtime.Manifest;
export default manifest;