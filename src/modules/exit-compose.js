// fixes native bug with unhandled escape

import registerModule from '~/module';

function exitCompose() {
  const siteModal = document.querySelector('#site-modal');

  const observer = new MutationObserver(() => {
    if (!siteModal.children.length) {
      observer.disconnect();
      window.location.hash = '#message/inbox';
    }
  });

  observer.observe(siteModal, {
    childList: true,
  });
}

export default registerModule('{53b77a69-c31b-4f9f-b17d-4f22c445bd5e}', {
  name: 'Exit Compose',
  main: exitCompose,
  showInOptions: false,
});
