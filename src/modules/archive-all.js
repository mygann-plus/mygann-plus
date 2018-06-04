import { waitForLoad } from '../utils/dom';
import registerModule from '../utils/module';

const MESSAGE = `
  This may take a few moments or temporarily slow down the website. 
  Please do not use OnCampus until the operation is complete. Continue?
`;


function archive() {
  const buttonClassName = 'conv-tooltip conv-archive btn bb-btn-secondary btn-sm pull-right mt-5';
  let buttons = document.getElementsByClassName(buttonClassName);
  document.getElementById('archivingMessage').style.display = 'inline-block';
  for (let i in buttons) {
    if (typeof buttons[i] === 'object') buttons[i].click();
  }
  setTimeout(() => {
    buttons = document.getElementsByClassName(buttonClassName);
    if (buttons.length > 0) {
      archive();
    } else {
      document.getElementById('archivingMessage').style.display = 'none';
      alert('Archive/Unarchive Completed! You may now resume using OnCampus'); // eslint-disable-line no-alert, max-len
    }
  }, 5000);
}

function handleButtonClick(e) {
  e.preventDefault();
  if (confirm(MESSAGE)) { // eslint-disable-line
    archive();
  }
}

function archiveAll() {

  const BUTTON_TEXT = window.location.hash === '#message/inbox' ? 'Archive All' : 'Unarchive All';
  const ARCHIVING_TEXT = window.location.hash === '#message/inbox' ? 'Archiving' : 'Unarchiving';

  waitForLoad(() => document.getElementById('compose-message-button')).then(() => {

    let a = document.createElement('a');

    a.className = 'btn bb-btn-secondary btn-sm';
    a.href = '#';
    a.style.margin = '5px 0px 5px 10px';
    a.innerHTML = `<i class="fa fa-archive"></i> ${BUTTON_TEXT}`;
    a.addEventListener('click', handleButtonClick);

    let archivingMessage = document.createElement('span');
    archivingMessage.innerText = `${ARCHIVING_TEXT} in progress... Please wait.`;
    archivingMessage.id = 'archivingMessage';
    archivingMessage.style.display = 'none';
    archivingMessage.style.marginLeft = '10px';

    document.getElementById('button-bar').children[0].appendChild(a);
    document.getElementById('button-bar').children[0].appendChild(archivingMessage);

  });
}

export default registerModule('Archive All', archiveAll);
