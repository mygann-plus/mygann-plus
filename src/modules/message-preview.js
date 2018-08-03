import getUrls from 'get-urls-to-array';

import registerModule from '~/utils/module';
import { fetchApi } from '~/utils/fetch';
import { insertCss, createElementFromHTML } from '~/utils/dom';
import { sanitizeHTMLString } from '~/utils/string';

const TRANSITION_TIME = 500; // milliseconds for fade in/out animations

let wrapperElem;
const displayedMessages = new Set();

const identifiers = {
  messageMain: 'gocp_message-preview_message-main',
  controls: 'gocp_message-preview_message-archive',
  text: 'gocp_message-preview_message-text',
};

const messageStyles = `
  .${identifiers.messageMain} {
    background: #52abf9;
    max-width: 460px;
    padding: 22px;
    border-radius: 4px;
    box-shadow: 0px 3px 5px #c1bbbb;
    margin-bottom: 10px;
    color: white;
    text-decoration: none;
    opacity: 0;
    transition: opacity ${TRANSITION_TIME}ms;
    display: flex;
    padding-right: 40px;
  }
  .${identifiers.controls} {
    color: white;
    right: 11px;
    bottom: 28px;
    font-size: 20px;
    cursor: pointer;
    display: inline-block;
    vertical-align: text-bottom;
    display: flex;
  }
  .${identifiers.text} {
    margin-right: 4%;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    text-overflow: ellipsis;
    max-width: 343px;
  }
`;

const formatBodyText = text => {
  const formatted = text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/<br>/g, ' ')
    .trim();
  return sanitizeHTMLString(formatted);
};
const isOnMessagesInbox = () => window.location.hash === '#message/inbox';


class MessagePreview {

  constructor(message, disappearTime) {
    const bodyText = formatBodyText(message.body);

    const messageHtml = `
      <a href="https://gannacademy.myschoolapp.com/app/student#message/conversation/${message.id}">
        <div class="${identifiers.messageMain}">
          <div class="${identifiers.text}">
            <b class="gocp_message_preview_message-from">${message.from}: </b>
            <span class="gocp_message-preview_message-body">
              ${bodyText}
            </span>
          </div>
          <div class="${identifiers.controls}">
            <i class="fa fa-archive"></i>
            <i class="fa fa-link" style="margin-left: 50%; margin-top: 1px;"></i>
          </div>
        </div>
      </a>
    `;

    this.messageElem = createElementFromHTML(messageHtml);
    /* eslint-disable prefer-destructuring */
    this.main = this.messageElem.children[0];
    this.archive = this.main.children[1].children[0];
    this.link = this.main.children[1].children[1];
    /* eslint-enable prefer-destructuring */

    this.disappearTime = disappearTime;
    this.urls = getUrls(bodyText);

    this.addEventListeners();
  }

  addEventListeners() {
    this.main.addEventListener('click', () => this.removeMessage());

    this.archive.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.archiveMessage();
      this.removeMessage();
    });

    if (this.urls.length) {
      this.link.addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.open(this.urls[0]);
        this.removeMessage();
      });
    } else {
      this.link.remove();
    }

    this.fadeIn();
    setTimeout(() => this.fadeOut(), this.disappearTime * 1000);
  }

  removeMessage() {
    this.messageElem.children[0].style.opacity = '0';
    setTimeout(() => {
      if (this.messageElem.parentNode) {
        this.messageElem.remove();
      }
    }, TRANSITION_TIME);
  }

  archiveMessage() {
    if (isOnMessagesInbox()) {
      document
        .querySelector(`tr[data-messageid="${this.message.id}"] button[title="Archive"]`)
        .click();
    } else {
      fetchApi(`/api/message/conversationarchive/${this.message.id}?format=json`, {
        method: 'PUT',
        body: JSON.stringify({
          id: this.message.id,
          unarchive: false,
        }),
      });
    }
  }

  fadeOut() {
    if (!wrapperElem.matches(':hover')) {
      this.removeMessage();
    } else {
      wrapperElem.addEventListener('mouseleave', () => {
        this.removeMessage();
      }, {
        once: true,
      });
    }
  }
  fadeIn() {
    this.main.style.opacity = '1';
  }
}

function createWrapper() {
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.right = '60px';
  wrap.style.bottom = '50px';
  wrap.style.zIndex = '1';
  return wrap;
}

function generatePreviews(messages, disappearTime) {
  for (const message of messages) {
    if (!displayedMessages.has(message.id)) {
      displayedMessages.add(message.id);
      const preview = new MessagePreview(message, disappearTime);
      wrapperElem.appendChild(preview.messageElem);
    }
  }
}

async function getMessages() {
  try {
    const data = await fetchApi('/api/message/inbox/?format=json');
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
  } catch (e) {
    // will throw if not signed in or servers are down
    // don't display error message, because errors are shown natively
    return [];
  }
}

async function messagePreview(options) {
  if (!wrapperElem) {
    insertCss(messageStyles);
    wrapperElem = createWrapper();
    document.body.appendChild(wrapperElem);
  }
  const messages = (await getMessages()).slice(0, options.maxMessages);
  generatePreviews(messages, options.disappearTime);
}

export default registerModule('Message Preview', messagePreview, {
  options: {
    maxMessages: {
      type: 'number',
      name: 'Maximum Messages to Preview',
      defaultValue: 3,
      min: 0,
      validator: val => (
        Math.floor(val) === val
      ),
    },
    disappearTime: {
      type: 'number',
      name: 'Disappear Time (seconds)',
      defaultValue: 5,
      min: 0,
    },
  },
});
