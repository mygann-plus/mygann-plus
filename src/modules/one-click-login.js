import registerModule from '~/module';
import { waitForLoad } from '~/utils/dom';

const getUsernameField = () => document.getElementById('Username');
const getPasswordDiv = () => document.getElementById('divPassword');
const getNextbtn = () => document.getElementById('nextBtn');

async function enableUsernameField() {
  await waitForLoad(() => document.getElementById('site-login-alert').children.length);
  getUsernameField().disabled = false;
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
