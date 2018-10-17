import registerModule from '~/module';

import { fetchApi } from '~/utils/fetch';

import { addMessageBarButton, getAllMessages, refreshMessageList } from '~/shared/messages';

function readMessage(id) {
  const endpoint = `/api/message/conversation/${id}?markAsRead=true&format=json`;
  return fetchApi(endpoint);
}

async function readAll() {
  const messages = await getAllMessages(true);

  // messages must be archived all at once, or MyGann returns incorrect data
  await Promise.all(messages.map(m => {
    return readMessage(m.ConversationId);
  }));
  refreshMessageList();
}


async function markAllAsRead(opts, unloaderContext) {

  const { button, message } = await addMessageBarButton({
    buttonText: 'Mark All As Read',
    messageText: 'Marking All As Read',
    onClick: readAll,
  });

  unloaderContext.addRemovable(button);
  unloaderContext.addRemovable(message);
}

export default registerModule('{23137ce2-c9ae-472a-8692-0c43fde41300}', {
  name: 'Mark All As Read',
  description: 'Button to mark all messages as read',
  main: markAllAsRead,
});
