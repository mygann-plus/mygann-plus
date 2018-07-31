// fixes native bug with unhandled escape

import registerModule from '../utils/module';

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

export default registerModule('Exit Compose', exitCompose, {
  showInOptions: false,
});
