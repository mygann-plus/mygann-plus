import { isBookmarklet } from '~/utils/bookmarklet';

export default function getManifest() {
  if (isBookmarklet()) {
    return {
      version_name: '0.5.0-beta',
      description: 'A collection of modules that improve your MyGann experience',
    };
  } else {
    return chrome.runtime.getManifest();
  }
}
