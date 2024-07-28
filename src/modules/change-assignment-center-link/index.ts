import registerModule from '~/core/module';

import { waitForLoad } from '~/utils/dom';

const domQuery = () => document.getElementById('assignment-center-btn');

async function changeLink() {
  const linkButton = await waitForLoad(domQuery);
  try {
    linkButton.setAttribute(
      'href',
      '/app/student#studentmyday/assignment-center',
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

export default registerModule('{eec0a74b-0e45-4ed6-bb40-dbc1955b4dc6}', {
  name: 'Revert Assignment Center To Original Link',
  description:
    // eslint-disable-next-line max-len
    'Changes the url of the "Assignment Center" button to be the original one instead of the new one added in 2024-2025',
  main: changeLink,
  defaultEnabled: false,
});
