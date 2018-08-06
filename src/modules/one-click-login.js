import createModule from '~/utils/module';
import { waitForLoad } from '~/utils/dom';

const getPasswordDiv = () => document.getElementById('divPassword');
const getNextbtn = () => document.getElementById('nextBtn');

async function oneClickLogin() {
  await waitForLoad(() => getPasswordDiv() && getNextbtn());

  getPasswordDiv().style.display = 'block';
  getNextbtn().value = 'Login';

  document.getElementById('nextBtn').addEventListener('click', async () => {
    document.getElementById('loginBtn').click();
    await waitForLoad(() => document.getElementById('site-login-alert').children.length);
    document.getElementById('Username').disabled = false;
  });
}

export default createModule('One Click Login', oneClickLogin, {
  description: (`
    Restore login screen before the summer of 2018 update, 
     with only one login button (as opposed to post-2018 version, 
    which requires two button clicks: "next", then "login")
  `),
});
