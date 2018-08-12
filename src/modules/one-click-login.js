import createModule from '~/module';
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

export default createModule('{6ca82534-e670-490a-8ce1-1d87f48c7c32}', {
  name: 'One Click Login',
  description: `
    Restore login screen before the summer of 2018 update, 
    with only one login button (as opposed to post-2018 version, 
    which requires two button clicks: "next", then "login")
  `,
  main: oneClickLogin,
});
