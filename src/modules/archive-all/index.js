import registerModule from '~/module';

import { createElement, waitForLoad, constructButton, insertCss } from '~/utils/dom';
import Flyout from '~/utils/flyout';

import style from './style.css';

const selectors = {
  flyoutMessage: style.locals['flyout-message'],
};

const MESSAGE = `
This may take a few moments or temporarily slow down the website. 
Please do not use OnCampus until the operation is complete.
`.trim();

const textMap = {
  '#message/inbox': {
    button: 'Archive All',
    message: 'Archiving',
  },
  '#message/archive': {
    button: 'Unarchive All',
    message: 'Unarchiving',
  },
};

function archive() {
  const buttonClassName = 'conv-archive';
  let buttons = document.getElementsByClassName(buttonClassName);

  if (!buttons.length) {
    return false;
  }

  document.getElementById('archivingMessage').style.display = 'inline-block';
  for (const button of buttons) {
    button.click();
  }
  setTimeout(() => {
    buttons = document.getElementsByClassName(buttonClassName);
    if (!archive()) {
      document.getElementById('archivingMessage').style.display = 'none';
    }
  }, 5000);

  return true;
}

function handleButtonClick(e) {
  e.preventDefault();
  const flyout = new Flyout((
    <div>
      <div className={selectors.flyoutMessage}>
        { MESSAGE }
      </div>
      {
        constructButton('Continue', '', '', () => {
          flyout.hide();
          archive();
        })
      }
    </div>
  ));
  flyout.showAtElem(e.target);
}

async function archiveAll(opts, unloaderContext) {
  const text = textMap[window.location.hash];
  if (!text) {
    // keep previous button on page, but don't add a new one.
    return;
  }

  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const BUTTON_TEXT = window.location.hash === '#message/inbox' ? 'Archive All' : 'Unarchive All';
  const ARCHIVING_TEXT = window.location.hash === '#message/inbox' ? 'Archiving' : 'Unarchiving';

  await waitForLoad(() => document.getElementById('compose-message-button'));

  const button = constructButton(BUTTON_TEXT, '', 'fa fa-archive', handleButtonClick);
  button.style.margin = '5px 0px 5px 10px';

  const archivingMessage = (
    <span
    id="archivingMessage"
    style={{ display: 'none', marginLeft: '10px' }}
    >
      {ARCHIVING_TEXT} in progress... Please wait.
    </span>
  );

  document.getElementById('button-bar').children[0].appendChild(button);
  document.getElementById('button-bar').children[0].appendChild(archivingMessage);

  unloaderContext.addRemovable(button);
  unloaderContext.addRemovable(archivingMessage);
}

export default registerModule('{ca448b9b-1d12-487e-8afd-1be45ad520b8}', {
  name: 'Archive All',
  description: 'Button to archive and unarchive all messages',
  main: archiveAll,
});
