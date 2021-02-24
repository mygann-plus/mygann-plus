/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad, createElement } from '~/utils/dom';

const domQuery = {
  buttons: () => document.querySelector('#divButtons') as HTMLElement,
};

async function loginMain() {
  const buttons = await waitForLoad(domQuery.buttons);
  const loginBtn = buttons.querySelector('#loginBtn') as HTMLElement;
  const nextBtn = buttons.querySelector('#nextBtn') as HTMLElement;
  const obs = new MutationObserver(() => {
    console.log(loginBtn.style.display !== 'none', nextBtn.style.display === 'none');
    if (loginBtn.style.display !== 'none' || nextBtn.style.display === 'none') {
      loginBtn.style.display = 'none';
      newBtn.style.display = '';
      console.log('logging');
    }
  });
  obs.observe(buttons, { attributes: true, childList: false, subtree: true });
  const newBtn = (
    <span style={{ display: 'none' }} id="areaConfirmation" onClick={() => {
      newBtn.style.display = 'none';
      obs.disconnect();
      loginBtn.style.display = ''; // show it
    }
    }>
      <input type="button" value="Are your sure?" className="btn btn-default btn-primary btn-lg" />
    </span>
  );

  buttons.appendChild(newBtn);
}

export default registerModule('{8b019bdf-7d0f-4db5-a5ba-abb3b8711392}', {
  name: 'Three click login',
  main: loginMain,
});
