import { fetchApi } from '~/utils/fetch';
import { createElement, constructButton, waitForLoad, insertCss } from '~/utils/dom';
import Flyout from '~/utils/flyout';
import tick from '~/utils/tick';

import style from './style.css';

export function archiveMessage(id, unarchive = false) {
  return fetchApi(`/api/message/conversationarchive/${id}?format=json`, {
    method: 'PUT',
    body: JSON.stringify({
      id,
      unarchive,
    }),
  });
}

const selectors = {
  warning: style.locals.warning,
  message: style.locals.message,
};

function handleButtonClick(e, messageElem, callback) {
  e.preventDefault();
  const flyout = new Flyout((
    <div>
      <div className={selectors.warning}>
        This may take a few moments. Please do not use MyGann until the operation finishes
      </div>
      {
        constructButton('Continue', '', '', () => {
          messageElem.style.display = 'inline-block';
          flyout.hide();
          callback();
        })
      }
    </div>
  ));
  flyout.showAtElem(e.target);
}

export async function addMessageBarButton({
  buttonText, messageText, onClick,
}) {

  const styles = insertCss(style.toString());

  await waitForLoad(() => document.getElementById('compose-message-button'));

  const message = (
    <span
      className={selectors.message}
    >
      {messageText} in progress... Please wait.
    </span>
  );

  const button = constructButton(buttonText, '', 'fa fa-archive', e => {
    handleButtonClick(e, message, onClick);
  });
  button.style.margin = '5px 0px 5px 10px';

  const buttonBar = document.querySelector('#button-bar > :first-child');
  buttonBar.appendChild(button);
  buttonBar.appendChild(message);

  return { button, message, styles };

}

function getMessagePage(inbox, index) {
  let query = `?format=json&pageNumber=${index}`;
  if (!inbox) {
    query += '&archiveStatus=1';
  }
  return fetchApi(`/api/message/inbox/${query}`);
}


export async function getAllMessages(inbox = true, page = 0, messages = []) {
  const pageMessages = await getMessagePage(inbox, page);

  if (pageMessages.length > 0) {
    messages.push(...pageMessages);
    return getAllMessages(inbox, page + 1, messages);
  }
  return messages;

}

export async function getAllMessageConversations() {
  const messages = await getAllMessages();
  const conversations = Promise.all(messages.map(async message => {
    const query = `/api/message/conversation/${message.ConversationId}`;
    return fetchApi(query);
  }));
  return conversations;
}

// switches hashes, then goes back, which refreshes message list
export async function refreshMessageList() {
  const oldHash = window.location.hash;
  window.location.hash = '#message/officialnotes';
  await tick();
  window.location.hash = oldHash;
}
