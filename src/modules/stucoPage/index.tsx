import registerModule from '~/core/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';

const domQuery = () => document.querySelector('#site-main > div');

function createStucoForm() {
  return (
    <iframe
      style={{
        border: 'none',
        width: '-webkit-fill-available',
        height: '300vh',
      }}
      src="https://forms.office.com/r/X5zbTheskg?embed=true"
    ></iframe>
  );
}

async function stucoMain() {
  const buttonBar = await waitForLoad(domQuery);
  buttonBar.appendChild(createStucoForm());
}

export default registerModule('{4fee1231-40a8-4ed0-9e40-6709caa6109f}', {
  name: 'Stuco Page',
  description: 'A page for student council. currently just a form',
  main: stucoMain,
  showInOptions: false,
});
