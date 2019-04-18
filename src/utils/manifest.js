import { isBookmarklet } from '~/utils/bookmarklet';

export default function getManifest() {
  if (isBookmarklet()) {
    return {
      version_name: '1.7.2',
      description: 'A collection of modules that improve your MyGann experience',
    };
  } else {
    return chrome.runtime.getManifest();
  }
}
