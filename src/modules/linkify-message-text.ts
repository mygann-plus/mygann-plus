import linkifyHtml from 'linkifyjs/html';

import registerModule from '~/core/module';
import { waitForOne } from '~/utils/dom';

const selectors = {
  link: 'gocp_linkify-message-text_link',
};

function linkifyMessageBody(messageBody: HTMLElement) {
  messageBody.innerHTML = linkifyHtml(messageBody.innerHTML, {
    className: selectors.link,
    attributes: {
      rel: 'noopener',
    },
  });
}

const domQuery = () => document.querySelectorAll('.modal-dialog .message-list-body');

async function linkifyMessageText() {
  const messageBodies = await waitForOne(domQuery);
  for (const messageBody of messageBodies) {
    linkifyMessageBody(messageBody as HTMLElement);
  }
}

function unloadLinkifyMessageText() {
  const links = document.querySelectorAll(`.${selectors.link}`);
  for (const link of links) {
    // replaces link with text inside
    link.replaceWith(link.firstChild);
  }
}

export default registerModule('{a0bcd3b0-2b61-4cf9-8435-ee988bd2c95e}', {
  name: 'Message Links',
  description: 'Make links in messages clickable',
  main: linkifyMessageText,
  unload: unloadLinkifyMessageText,
});
