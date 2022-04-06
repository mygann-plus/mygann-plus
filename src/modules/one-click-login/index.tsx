import registerModule from '~/core/module';
import { createElement, insertCss, waitForLoad } from '~/utils/dom';
import { isBookmarklet } from '~/utils/bookmarklet';
import Dialog from '~/utils/dialog';

import style from './style.css';

const getUsernameField = () => document.getElementById('Username') as HTMLInputElement;
const getPasswordDiv = () => document.getElementById('divPassword') as HTMLInputElement;
const getNextbtn = () => document.getElementById('nextBtn');

const domQuery = {
  siteLoginAlert: () => document.getElementById('site-login-alert') as HTMLElement,
  buttons: () => document.querySelector('#divButtons'),
};

async function enableUsernameField() {
  await waitForLoad(() => domQuery.siteLoginAlert().children.length);
  getUsernameField().disabled = false;
}

function showRerunExplanationDialog(e: Event) {
  e.preventDefault();
  const dialogBody = (
    <span>
      Because of technical limitations, the MyGann+ Bookmark cannot continue running when you
      browse to another website, and has to be run again. Withinn MyGann, when navigating within
      pages (for example, from Schedule to Messages), you are not visiting another website,
      and so MyGann+ remains running. However, when you login, MyGann redirects you to another
      website, so the MyGann+ Bookmark stops running, and you must run the MyGann+ Bookmark
      again once you are logged in.
    </span>
  );
  const dialog = new Dialog('MyGann+ Bookmark Re-Run Explanation', dialogBody, {
    leftButtons: [Dialog.buttons.OK],
  });
  dialog.open();
}

async function insertRerunNotice() {
  const notice = (
    <div style={{ margin: '10px 0' }}>
      The MyGann+ bookmark must be run again after
      logging in (<a href="#" onClick={(e: any) => showRerunExplanationDialog(e)}>why?</a>)
    </div>
  );
  // document.querySelector('#areaCancel + .clear').after(notice);
  (await waitForLoad(domQuery.buttons)).appendChild(notice);
}

async function oneClickLoginMain() {
  await waitForLoad(() => getPasswordDiv() && getNextbtn());

  getPasswordDiv().style.display = 'block';
  getNextbtn().style.display = 'none';
  document.getElementById('areaLogin').style.display = 'block';

  document.getElementById('loginBtn').addEventListener('click', async () => {
    enableUsernameField();
  });
  getNextbtn().addEventListener('click', async () => {
    document.getElementById('loginBtn').click();
    enableUsernameField();
  });
  getUsernameField().addEventListener('input', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      document.getElementById('loginBtn').click();
      enableUsernameField();
    }
  });

  if (isBookmarklet()) {
    insertRerunNotice();
  }

}

function main2() {
  insertCss(style.toString());
  if (isBookmarklet()) {
    insertRerunNotice();
  }
}

// first is remote disabled
export default registerModule('{6ca82534-e670-490a-8ce1-1d87f48c7c32}' && '{b25f7d4a-7ba6-4fb7-8b6b-0a3cb57ea758}', {
  name: 'One Click Login',
  description: `
    Restore login screen before the summer of 2018 update, 
    with only one login button (as opposed to post-2018 version, 
    which requires two button clicks: "next", then "login")
  `,
  main: main2,
  // main: oneClickLoginMain,
});
