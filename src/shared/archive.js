import { fetchApi } from '~/utils/fetch';

export default function archiveMessage(id, unarchive = false) {
  return fetchApi(`/api/message/conversationarchive/${id}?format=json`, {
    method: 'PUT',
    body: JSON.stringify({
      id,
      unarchive,
    }),
  });
}
