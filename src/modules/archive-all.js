import createModule from '~/utils/module';

import { createElement, waitForLoad, constructButton } from '~/utils/dom';

const MESSAGE = `
This may take a few moments or temporarily slow down the website. 
Please do not use OnCampus until the operation is complete. Continue?
`.trim();


function archive() {
  const buttonClassName = 'conv-archive';
  let buttons = document.getElementsByClassName(buttonClassName);
  document.getElementById('archivingMessage').style.display = 'inline-block';
  for (const button of buttons) {
    button.click();
  }
  setTimeout(() => {
    buttons = document.getElementsByClassName(buttonClassName);
    if (buttons.length > 0) {
      archive();
    } else {
      document.getElementById('archivingMessage').style.display = 'none';
    }
  }, 5000);
}

function handleButtonClick(e) {
  e.preventDefault();
  if (confirm(MESSAGE)) { // eslint-disable-line
    archive();
  }
}

async function archiveAll(opts, unloaderContext) {

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

export default createModule('{ca448b9b-1d12-487e-8afd-1be45ad520b8}', {
  name: 'Archive All',
  main: archiveAll,
});
