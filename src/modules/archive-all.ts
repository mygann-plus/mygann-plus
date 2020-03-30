import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import {
  archiveMessage,
  addMessageBarButton,
  getAllMessages,
  refreshMessageList,
} from '~/shared/messages';

const selectors = {
  button: 'gocp_archive-all_button',
};

interface TextMap {
  [hash: string]: {
    button: string;
    message: string;
  }
}

const textMap: TextMap = {
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

async function archive() {
  const messages = await getAllMessages(isOnInbox());

  // messages must be archived all at once, or MyGann returns incorrect data
  await Promise.all(messages.map((m: any) => {
    return archiveMessage(m.ConversationId, !isOnInbox());
  }));
  refreshMessageList();
}


async function archiveAllMain(opts: void, unloaderContext: UnloaderContext) {

  const existingButton = document.getElementById(selectors.button);
  const text = textMap[window.location.hash];
  if (!text || existingButton) {
    // keep previous button on page, but don't add a new one.
    return;
  }

  const buttonText = window.location.hash === '#message/inbox' ? 'Archive All' : 'Unarchive All';
  const messageText = window.location.hash === '#message/inbox' ? 'Archiving' : 'Unarchiving';

  const { button, message, styles } = await addMessageBarButton({
    buttonText,
    messageText,
    id: selectors.button,
    onClick: archive,
    iconClassName: 'fa fa-archive',
  });

  unloaderContext.addRemovable(styles);
  unloaderContext.addRemovable(button);
  unloaderContext.addRemovable(message);
}

export default registerModule('{ca448b9b-1d12-487e-8afd-1be45ad520b8}', {
  name: 'Archive All',
  description: 'Button to archive and unarchive all messages',
  main: archiveAllMain,
});
