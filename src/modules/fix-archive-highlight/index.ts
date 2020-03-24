/*
 * Fixes native MyGann bug where "Official Notes" is highlighted on messages archived page
 *
 * Styles active on all #message page to prevent flashing effect when switching to /archive
 * Flash is still present when not navigating to #message/archive from another page, but this is
 * likely a rare event.
*/

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { insertCss } from '~/utils/dom';

import style from './style.css';

async function fixArchiveHighlightMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
}

export default registerModule('{5a8a766a-39cf-4c97-b049-02c7cded7372}', {
  name: 'fix.fixArchiveHighlight',
  init: fixArchiveHighlightMain,
  showInOptions: false,
});
