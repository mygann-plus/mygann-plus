// Fixes native MyGann bug where dividers (in user menu, directories dropdown, etc)
// do not always appear, particularly in non-WebKit browsers

import registerModule from '~/module';
import { insertCss } from '~/utils/dom';

import style from './style.css';

function userMenuDivider() {
  insertCss(style.toString());
}

export default registerModule('{b69a4a6d-85ac-44f5-b12c-b3114beacf7b}', {
  name: 'fix.fixDividers',
  init: userMenuDivider,
  showInOptions: false,
});
