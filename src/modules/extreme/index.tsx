import registerModule from '~/core/module';

import { insertCss } from '~/utils/dom';

import procrastinate from './procrastinate';
import style from './style.css';
import cancelClass from './cancel-class';

function isAprilFirst() {
  const date = new Date();
  return date.getDate() === 1 && date.getMonth() === 3;
}


function extremeMain() {
  insertCss(style.toString());
  if (!isAprilFirst()) {
    return;
  }
  switch (window.location.hash) {
    case '#studentmyday/assignment-center':
      procrastinate();
      break;
    case '#studentmyday/schedule':
      cancelClass();
      break;
    default:
  }
}

export default registerModule('{508be51e-75e5-41da-afeb-d7b5cad20e94}', {
  name: 'easteregg.extreme',
  main: extremeMain,
  defaultEnabled: true,
  showInOptions: false,
});
