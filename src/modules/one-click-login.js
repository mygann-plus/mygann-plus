import registerModule from '~/module';
import { createElement, waitForLoad } from '~/utils/dom';
import { isBookmarklet } from '~/utils/bookmarklet';
import Dialog from '~/utils/dialog';

const getUsernameField = () => document.getElementById('Username');
const getPasswordDiv = () => document.getElementById('divPassword');
const getNextbtn = () => document.getElementById('nextBtn');

async function enableUsernameField() {
  await waitForLoad(() => document.getElementById('site-login-alert').children.length);
  getUsernameField().disabled = false;
}

function showRerunExplanationDialog(e) {
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

function insertRerunNotice() {
  const notice = (
    <div style={{ margin: '10px 0' }}>
      The MyGann+ bookmark must be run again after
      logging in (<a href="#" onClick={showRerunExplanationDialog}>why?</a>)
    </div>
  );
  document.querySelector('#areaCancel + .clear').after(notice);
}

async function oneClickLogin() {
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
  getUsernameField().addEventListener('input', e => {
    if (e.key === 'Enter') {
      document.getElementById('loginBtn').click();
      enableUsernameField();
    }
  });

  if (isBookmarklet()) {
    insertRerunNotice();
  }

}

export default registerModule('{6ca82534-e670-490a-8ce1-1d87f48c7c32}', {
  name: 'One Click Login',
  description: `
    Restore login screen before the summer of 2018 update, 
    with only one login button (as opposed to post-2018 version, 
    which requires two button clicks: "next", then "login")
  `,
  main: oneClickLogin,
});
