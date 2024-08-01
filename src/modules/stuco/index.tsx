import registerModule from '~/core/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';

import style from './style.css';

const domQuery = () => document.querySelector('#site-nav-lower > div > ul');

function createStucoButton() {
  return (
    <li>
      <a
        id="stuco-btn"
        href="#studentmyday/stuco"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <i
          style={{
            backgroundImage: 'url(https://i.imgur.com/iGZXX6h.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            width: '20px',
            height: '20px',
            display: 'inline-block',
          }}
        ></i>
        Stuco
      </a>
    </li>
  );
}

async function stucoMain() {
  const buttonBar = await waitForLoad(domQuery);
  buttonBar.appendChild(createStucoButton());
}

export default registerModule('{1de0e122-8f76-40d8-b081-ea1e4e86fb7d}', {
  name: 'Stuco Button',
  description: 'A button in the bar to access the stuco page',
  main: stucoMain,
  showInOptions: true,
});
