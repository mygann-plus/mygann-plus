import registerModule from '~/module';

import { createElement, waitForLoad, constructButton, insertCss } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import Flyout from '~/utils/flyout';
import tick from '~/utils/tick';

import archiveMessage from '~/shared/archive';

import style from './style.css';

const selectors = {
  flyoutMessage: style.locals['flyout-message'],
  archivingMessage: style.locals['archiving-message'],
};

const MESSAGE = `
This may take a few moments. Please do not use OnCampus until the operation finishes.
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

const isOnInbox = () => window.location.hash === '#message/inbox';

// switches hashes, then goes back, which refreshes message list
async function reloadHash() {
  const oldHash = window.location.hash;
  window.location.hash = '#message/officialnotes';
  await tick();
  window.location.hash = oldHash;
}

function getMessagePage(index) {
  let query = `?format=json&pageNumber=${index}`;
  if (!isOnInbox()) {
    query += '&archiveStatus=1';
  }
  return fetchApi(`/api/message/inbox/${query}`);
}

async function archive(page = 0, messages = []) {
  const pageMessages = await getMessagePage(page);

  if (pageMessages.length > 0) {
    messages.push(...pageMessages);
    return archive(page + 1, messages);
  }

  // messages must be archived all at once, or OnCampus returns incorrect data
  await Promise.all(messages.map(m => {
    return archiveMessage(m.ConversationId, !isOnInbox());
  }));
  reloadHash();
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
          document.querySelector(`#${selectors.archivingMessage}`).style.display = 'inline-block';
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
      id={selectors.archivingMessage}
    >
      {ARCHIVING_TEXT} in progress... Please wait.
    </span>
  );

  const buttonBar = document.querySelector('#button-bar > :first-child');
  buttonBar.appendChild(button);
  buttonBar.appendChild(archivingMessage);

  unloaderContext.addRemovable(button);
  unloaderContext.addRemovable(archivingMessage);
}

export default registerModule('{ca448b9b-1d12-487e-8afd-1be45ad520b8}', {
  name: 'Archive All',
  description: 'Button to archive and unarchive all messages',
  main: archiveAll,
});
