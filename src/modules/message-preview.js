import getUrls from 'get-urls-to-array';

import registerModule from '~/utils/module';
import { fetchApi } from '~/utils/fetch';
import { createElement, insertCss } from '~/utils/dom';

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
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/<br>/g, ' ')
    .trim();
};
const isOnMessagesInbox = () => window.location.hash === '#message/inbox';


class MessagePreview {

  constructor(message, disappearTime) {
    const bodyText = formatBodyText(message.body);

    this.urls = getUrls(bodyText);
    this.message = message;
    this.disappearTime = disappearTime;

    this.messageElem = (
      <a
        href={`https://gannacademy.myschoolapp.com/app/student#message/conversation/${message.id}`}
        onClick={ () => this.removeMessage() }
      >
        <div className={identifiers.messageMain}>
          <div className={identifiers.text}>
            <b>{message.from}: </b>
            <span>
              {bodyText}
            </span>
          </div>
          <div className={identifiers.controls}>
            <i className="fa fa-archive" onClick={e => this.onArchiveClick(e)}></i>
            {
              this.urls.length ?
              <i
                className="fa fa-link"
                style={{ marginLeft: '50%', marginTop: '1px' }}
                onClick={ () => this.removeMessage() }
              ></i> :
              null
            }
          </div>
        </div>
      </a>
    );

    this.main = this.messageElem.children[0]; // eslint-disable-line prefer-destructuring
    this.show();
  }

  show() {
    this.fadeIn();
    setTimeout(() => this.fadeOut(), this.disappearTime * 1000);
  }

  onArchiveClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.archiveMessage();
    this.removeMessage();
  }
  onLinkClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.open(this.urls[0]);
    this.removeMessage();
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
      defaultValue: 10,
      min: 0,
    },
  },
});
