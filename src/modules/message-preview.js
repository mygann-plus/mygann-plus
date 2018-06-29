import registerModule from '../utils/module';
import { fetchApi } from '../utils/fetch';
import { insertCss, createElementFromHTML, removeElement } from '../utils/dom';

const TRANSITION_TIME = 500; // milliseconds for fade in/out animations
const DISAPPEAR_TIME = 50000; // milliseconds for fade out
const MAX_MESSAGES = 3; // amount of messages to show at a time

const identifiers = {
  messagesWrap: 'gocp_message-preview_wrap',
  messageMain: 'gocp_message-preview_message-main',
  archive: 'gocp_message-preview_message-archive',
};

const messageStyles = `
  .${identifiers.messageMain} {
    background: #52abf9;
    padding: 20px;
    padding-right: 90px;
    border-radius: 4px;
    box-shadow: 0px 3px 5px #c1bbbb;
    margin-bottom: 10px;
    color: white;
    text-decoration: none;
    opacity: 0;
    transition: opacity ${TRANSITION_TIME}ms;
  }
  .${identifiers.archive} {
    color: white;
    right: 21px;
    bottom: 28px;
    position: absolute;
    font-size: 20px;
    cursor: pointer;
  }
`;

const formatBodyText = text => text.replace(/\n/g, ' ').replace(/\s\s/g, ' ');
const isOnMessagesInbox = () => window.location.hash === '#message/inbox';

function generateMessagePreview(message) {

  // CREATE ELEMENTS

  const messageHtml = `
    <a href="https://gannacademy.myschoolapp.com/app/student#message/conversation/${message.id}">
      <div class="${identifiers.messageMain}">
        <b class="gocp_message_preview_message-from">${message.from}: </b>
        <span class="gocp_message-preview_message-body">
          ${formatBodyText(message.body)}
          </span>
        <i class="fa fa-archive ${identifiers.archive}"></i>
      </div>
    </a>
  `;

  const messageElem = createElementFromHTML(messageHtml);
  const main = messageElem.children[0];
  const archive = main.children[2];

  // METHODS

  function removeMessage() {
    messageElem.children[0].style.opacity = '0';
    setTimeout(() => {
      if (messageElem.parentNode) {
        removeElement(messageElem);
      }
    }, TRANSITION_TIME);
  }

  function archiveMessage() {
    if (isOnMessagesInbox()) {
      document
        .querySelector(`tr[data-messageid="${message.id}"]`)
        .querySelector('button[title="Archive"]')
        .click();
    } else {
      fetchApi(`/api/message/conversationarchive/${message.id}?format=json`, {
        method: 'PUT',
        body: JSON.stringify({
          id: message.id,
          unarchive: false,
        }),
      });
    }
  }

  function fadeOut() {
    if (document.querySelectorAll(`#${identifiers.messagesWrap}:hover`).length === 0) {
      removeMessage();
    } else {
      document.getElementById(identifiers.messagesWrap).addEventListener('mouseleave', removeMessage);
    }
  }
  function fadeIn() {
    main.style.opacity = '1';
  }

  // EVENT LISTENERS & TRANSITIONS

  main.addEventListener('click', removeMessage);
  archive.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    archiveMessage();
    removeMessage();
  });

  fadeIn();
  setTimeout(fadeOut, DISAPPEAR_TIME);

  document.getElementById(identifiers.messagesWrap).appendChild(messageElem);
}

function generatePreviews(messages) {

  // don't re-show preview on hash change
  const existingWrap = document.getElementById(identifiers.messagesWrap);
  if (existingWrap) {
    return;
  }

  const wrapElem = document.createElement('div');
  wrapElem.id = identifiers.messagesWrap;
  wrapElem.style.position = 'fixed';
  wrapElem.style.right = '60px';
  wrapElem.style.bottom = '50px';
  wrapElem.style.zIndex = '1';

  document.body.appendChild(wrapElem);

  messages.forEach(m => generateMessagePreview(m, generatePreviews));
}

function getMessages() {
  return fetchApi('/api/message/inbox/?format=json')
    .then(data => {
      return data
        .map(conversation => {
          return conversation.Messages.filter(message => !message.ReadInd)[0];
        })
        .filter(Boolean)
        .map(conversation => ({
          from: `${conversation.FromUser.FirstName} ${conversation.FromUser.LastName}`,
          body: conversation.Body,
          id: conversation.ConversationId,
        }));
    });
}

async function messagePreview() {
  insertCss(messageStyles);
  const messages = (await getMessages()).slice(0, MAX_MESSAGES);
  generatePreviews(messages);
}

export default registerModule('Message Preview', messagePreview);
