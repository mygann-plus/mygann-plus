import classNames from 'classnames';
import { find as findLinks } from 'linkifyjs';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { getInstallTimestamp } from '~/core/install';

import { fetchApi } from '~/utils/fetch';
import { createElement, insertCss } from '~/utils/dom';

import { archiveMessage } from '~/shared/messages';

import style from './style.css';

const TRANSITION_TIME = 300; // milliseconds for fade in/out animations

// all vars are initialized in init to support dynamic reloading
let wrapperElem: HTMLElement;
let displayedMessages: Set<string>; // set of message IDs

const identifiers = {
  wrap: style.locals.wrap,
  messageMain: style.locals['message-main'],
  controls: style.locals.controls,
  control: style.locals.control,
  messageText: style.locals['message-text'],
};

const formatBodyText = (text: string) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/<br>/g, ' ')
    .trim();
};

interface Message {
  from: string;
  body: string;
  id: string;
}

class MessageNotification {

  private urls: string[];
  private message: Message;
  private disappearTime: number;
  private onRemove: Function;

  public messageElem: HTMLElement;
  private main: HTMLElement;

  constructor(message: Message, disappearTime: number, onRemove: Function, showLinkButton: boolean) { // eslint-disable-line max-len
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
              this.urls.length && showLinkButton
                ? <button
                className={classNames('fa fa-link', identifiers.control)}
                onClick={(e: any) => this.onLinkClick(e)}
                title={`Open Link: ${new URL(this.urls[0]).hostname}`}
              />
                : null
            }
            <button
              className={classNames('fa fa-archive', identifiers.control)}
              onClick={(e: any) => this.onArchiveClick(e)}
              title="Archive"
            />
            <button
              className={classNames('fa fa-times', identifiers.control)}
              onClick={(e: any) => this.onDimissClick(e)}
              title="Dismiss"
            />
          </div>
        </div>
      </a>
    );

    this.main = this.messageElem.children[0] as HTMLElement; // eslint-disable-line prefer-destructuring
  }

  show() {
    setTimeout(() => this.fadeIn(), 0);
    setTimeout(() => this.fadeOut(), this.disappearTime * 1000);
  }

  onLinkClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    window.open(this.urls[0]);
  }

  onArchiveClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    archiveMessage(this.message.id);
    this.removeMessage();
  }

  onDimissClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.markMessageAsRead();
    this.removeMessage();
  }

  removeMessage() {
    (this.messageElem.children[0] as HTMLElement).style.opacity = '0';
    setTimeout(() => {
      this.messageElem.remove();
      this.onRemove();
    }, TRANSITION_TIME);
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

const activeNotifications: MessageNotification[] = [];

function generateNotifications(messages: Message[], disappearTime: number, showLinkButton: boolean) { // eslint-disable-line max-len
  const { hash } = window.location;
  if (hash.startsWith('#message') && !hash.includes('conversation')) {
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

async function getMessages(): Promise<Message[]> {
  const installTimestamp = await getInstallTimestamp(); // only show messages after install
  const installTime = new Date(installTimestamp).getTime();
  try {
    const data = await fetchApi('/api/message/inbox/?format=json');
    return data
      .map((conversation: any) => {
        const messages = conversation.Messages.filter((message: any) => {
          return !message.ReadInd
          && installTime < new Date(message.SendDate).getTime();
        })[0];
        return messages;
      })
      .filter(Boolean)
      .map((conversation: any) => ({
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

function addStyles(wrap: HTMLElement) {
  const transitionPropertyName = '--transition-time';
  wrap.style.setProperty(transitionPropertyName, `${TRANSITION_TIME}ms`);
  return insertCss(style.toString());
}

async function messageNotificationsMain(options: MessageNotificationsSuboptions) {
  const messages = (await getMessages()).slice(0, options.maxMessages);
  generateNotifications(messages, options.disappearTime, options.showLinkButton);
}

function messageNotificationsInit(opts: void, unloaderContext: UnloaderContext) {
  displayedMessages = new Set();
  wrapperElem = createWrapper();
  document.body.appendChild(wrapperElem);
  unloaderContext.addRemovable(wrapperElem);

  const styles = addStyles(wrapperElem);
  unloaderContext.addRemovable(styles);
}

interface MessageNotificationsSuboptions {
  maxMessages: number;
  disappearTime: number;
  showLinkButton: boolean;
}

export default registerModule('{edf80057-becd-42f9-9117-995657904a91}', {
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
