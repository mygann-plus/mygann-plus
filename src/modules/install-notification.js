import registerModule from '~/module';

import { createElement, waitForLoad } from '~/utils/dom';
import Flyout from '~/utils/flyout';
import { getHeader } from '~/shared/user-menu';

import { hasInstalled, clearInstallState } from '~/install';

function createFlyoutBody() {
  return (
    <span>
      Thanks for installing <b>MyGann+</b>!
      You can find options in this menu.
    </span>
  );
}

async function installNotification() {
  if (await hasInstalled()) {
    const headerLink = await waitForLoad(() => (
      getHeader() && getHeader().parentNode.querySelector('a')
    ));
    const flyout = new Flyout(createFlyoutBody(), {
      onHide: clearInstallState,
    });
    // site-header-container is nearest ancestor that doesn't restrict width
    flyout.showAtElem(headerLink, headerLink.closest('#site-header-container'));
  }
}

export default registerModule('{826e61a8-06b8-458d-825f-e8b8f8ac3a0f}', {
  name: 'internal.installNotification',
  init: installNotification,
  showInOptions: false,
});
