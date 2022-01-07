/* Module to hide the grades button in progress that just shows dashes */

import registerModule from '~/core/module';
import { insertCss } from '~/utils/dom';

import style from './style.css';

function hideGradesButtonMain() {
  insertCss(style.toString());
}

export default registerModule('{fb8c80b5-5323-4132-b512-c3c83d6cc856}', {
  name: 'fix.hideProgressGradesButton',
  init: hideGradesButtonMain,
  affectsGlobalState: false,
  showInOptions: false,
});
