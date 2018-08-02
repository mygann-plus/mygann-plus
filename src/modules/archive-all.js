import { waitForLoad, constructButton } from '../utils/dom';
import registerModule from '../utils/module';

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

async function archiveAll() {

  const BUTTON_TEXT = window.location.hash === '#message/inbox' ? 'Archive All' : 'Unarchive All';
  const ARCHIVING_TEXT = window.location.hash === '#message/inbox' ? 'Archiving' : 'Unarchiving';

  await waitForLoad(() => document.getElementById('compose-message-button'));

  const button = constructButton(BUTTON_TEXT, '', 'fa fa-archive', handleButtonClick);
  button.style.margin = '5px 0px 5px 10px';

  const archivingMessage = document.createElement('span');
  archivingMessage.textContent = `${ARCHIVING_TEXT} in progress... Please wait.`;
  archivingMessage.id = 'archivingMessage';
  archivingMessage.style.display = 'none';
  archivingMessage.style.marginLeft = '10px';

  document.getElementById('button-bar').children[0].appendChild(button);
  document.getElementById('button-bar').children[0].appendChild(archivingMessage);
}

export default registerModule('Archive All', archiveAll);
