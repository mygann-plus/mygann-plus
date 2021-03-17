import { createElement } from '~/utils/dom';

import Dialog from '~/utils/dialog';

import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const POPUP_SEEN_KEY = 'has_seen_avatars_guide';

const dialogElement = ( //personal you
  <div>
    <p>
      Hello Gann students and faculty,<br /><br />
      Thank you for installing MyGann+. As many of you have seen, users can now change their profile image on the MyGann website. If you have not changed your image, we encourage you to do so. We are glad many of you have had fun changing your images already. Unfortunately, some teachers have gotten confused, especially by those of you who uploaded images of your classmates--which is really funny.<br /><br />
      We understand that some users have had trouble figuring out how to disable the avatars feature. We apologize for any confusion.<br /><br />
      To toggle off or on MyGann+ Avatars, click your name in the top-right corner of the window. When the dropdown appears, click “MyGann+ Options.” Scroll down to the “Avatars” option and toggle the module on or off using the toggle switch (left of the module description).<br /><br />
      We encourage all of you to continue uploading images.<br /><br />
      Thanks everyone,<br />
      Samuel Hirsh and Ilan Sperber
    </p>
  </div>
);

async function enableAvatars() {

}

async function disableAvatars() {

}

function disableAvatarsDialog() {
  // return storage.set(POPUP_SEEN_KEY, false, SCHEMA_VERSION);
}

export async function shouldShowAvatarsDialog() {
  const shouldShow = await storage.get(POPUP_SEEN_KEY, SCHEMA_VERSION);
  return shouldShow !== false;
}

export function createPopup() {
  const dialog = new Dialog('Spiritual Guide to the Avatar', dialogElement, {
    onClose() { console.log('CLOSED'); },
    leftButtons: [
      {
        name: 'Confirm',
        primary: true,
        onClick: disableAvatarsDialog,
      },
      {
        name: 'Confirm and Disable Avatars',
        primary: false,
        onClick() { disableAvatars(); disableAvatarsDialog(); },
      },
    ],
  });
  dialog.open();
}
