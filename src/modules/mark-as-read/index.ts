import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, constructButton, insertCss } from '~/utils/dom';

import style from './style.css';

const selectors = {
  button: style.locals.button,
  native: {
    unreadMessage: 'sky-background-color-info-light',
  },
};

async function read(messageElem: Element) {
  (messageElem as HTMLElement).click();
  const close = await waitForLoad(() => document.querySelector('.close') as HTMLElement);
  close.click();
}

function createButton(message: Element) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    read(message);
    (e.target as HTMLElement).remove();
  };
  const readButton = constructButton(
    'Mark as Read', '', '',
    handleClick,
    classNames('conv-tooltip bb-btn-secondary pull-right mt-5', selectors.button),
  );
  readButton.title = 'Mark as Read';
  return readButton;
}

const domQuery = () => document.querySelector('.conv-message');

async function markAsRead(opts: void, unloaderContext: UnloaderContext) {
  await waitForLoad(domQuery);
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const messages = document.querySelectorAll('.conv-message');
  for (const message of messages) {
    if (!message.classList.contains(selectors.native.unreadMessage)) {
      continue;
    }

    const archiveButton = message.querySelector('.conv-archive');
    const readButton = createButton(message);
    unloaderContext.addRemovable(readButton);

    archiveButton.after(readButton);
  }
}

export default registerModule('21382627b-49b0-4573-b812-1de680c03c3b', {
  name: 'Mark As Read',
  main: markAsRead,
});
