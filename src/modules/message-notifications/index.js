import classNames from 'classnames';
import { find as findLinks } from 'linkifyjs';

import createModule from '~/utils/module';
import { fetchApi } from '~/utils/fetch';
import { createElement, insertCss } from '~/utils/dom';

import style from './style.css';

const TRANSITION_TIME = 300; // milliseconds for fade in/out animations

// all vars are initialized in init to support dynamic reloading
let wrapperElem;
let displayedMessages;

const identifiers = {
  wrap: style.locals.wrap,
  messageMain: style.locals['message-main'],
  controls: style.locals.controls,
  control: style.locals.control,
  messageText: style.locals['message-text'],
};

const formatBodyText = text => {
  return text
    .replace(/\s+/g, ' ')
    .trim();
};

class MessageNotification {

  constructor(message, disappearTime, onRemove, showLinkButton) {
    const bodyText = formatBodyText(message.body);

    this.urls = findLinks(bodyText).map(x => x.href);
    this.message = message;
    this.disappearTime = disappearTime;
    this.onRemove = onRemove;

    this.messageElem = (
      <a
        href={`https://gannacademy.myschoolapp.com/app/student#message/conversation/${message.id}`}
        onClick={ () => this.removeMessage() }
      >
        <div className={identifiers.messageMain}>
          <div className={identifiers.messageText}>
            <b>{message.from}: </b>
            <span>
              {bodyText}
            </span>
          </div>
          <div className={identifiers.controls}>
            {
              this.urls.length && showLinkButton ?
              <button
                className={classNames('fa fa-link', identifiers.control)}
                onClick={e => this.onLinkClick(e)}
                title={`Open Link: ${new URL(this.urls[0]).hostname}`}
              /> :
              null
            }
            <button
              className={classNames('fa fa-archive', identifiers.control)}
              onClick={e => this.onArchiveClick(e)}
              title="Archive"
            />
            <button
              className={classNames('fa fa-times', identifiers.control)}
              onClick={e => this.onDimissClick(e)}
              title="Dismiss"
            />
          </div>
        </div>
      </a>
    );

    this.main = this.messageElem.children[0]; // eslint-disable-line prefer-destructuring
  }

  show() {
    setTimeout(() => this.fadeIn(), 0);
    setTimeout(() => this.fadeOut(), this.disappearTime * 1000);
  }

  onLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    window.open(this.urls[0]);
  }
  onArchiveClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.archiveMessage();
    this.removeMessage();
  }
  onDimissClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.markMessageAsRead();
    this.removeMessage();
  }

  removeMessage() {
    this.messageElem.children[0].style.opacity = '0';
    setTimeout(() => {
      this.messageElem.remove();
      this.onRemove();
    }, TRANSITION_TIME);
  }

  archiveMessage() {
    fetchApi(`/api/message/conversationarchive/${this.message.id}?format=json`, {
      method: 'PUT',
      body: JSON.stringify({
        id: this.message.id,
        unarchive: false,
      }),
    });
  }

  markMessageAsRead() {
    fetchApi(`/api/message/conversation/${this.message.id}?markAsRead=true&format=json`);
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
  return <div className={identifiers.wrap}></div>;
}

const activeNotifications = [];

function generateNotifications(messages, disappearTime, showLinkButton) {
  if (window.location.hash.startsWith('#message')) {
    // activeNotifications is spliced when .removeMessage is called
    const currentActiveNotifications = [...activeNotifications];
    for (const notification of currentActiveNotifications) {
      notification.removeMessage();
    }
    return;
  }

  for (const message of messages) {
    if (!displayedMessages.has(message.id)) {
      displayedMessages.add(message.id);
      const notification = new MessageNotification(message, disappearTime, () => {
        activeNotifications.splice(activeNotifications.indexOf(notification), 1);
      }, showLinkButton);
      wrapperElem.appendChild(notification.messageElem);
      notification.show();
      activeNotifications.push(notification);
    }
  }
  return activeNotifications;
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

function addStyles(wrap) {
  const transitionPropertyName = '--transition-time';
  wrap.style.setProperty(transitionPropertyName, `${TRANSITION_TIME}ms`);
  return insertCss(style.toString());
}

async function messageNotificationsMain(options) {
  const messages = (await getMessages()).slice(0, options.maxMessages);
  generateNotifications(messages, options.disappearTime, options.showLinkButton);
}

function messageNotificationsInit(opts, unloaderContext) {
  displayedMessages = new Set();
  wrapperElem = createWrapper();
  document.body.appendChild(wrapperElem);
  unloaderContext.addRemovable(wrapperElem);

  const styles = addStyles(wrapperElem);
  unloaderContext.addRemovable(styles);
}

export default createModule('{edf80057-becd-42f9-9117-995657904a91}', {
  name: 'Message Notifications',
  init: messageNotificationsInit,
  main: messageNotificationsMain,
  suboptions: {
    maxMessages: {
      type: 'number',
      name: 'Maximum Messages to Display',
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
    showLinkButton: {
      type: 'boolean',
      name: 'Shortcut to First Link in Message',
      defaultValue: false,
    },
  },
});
