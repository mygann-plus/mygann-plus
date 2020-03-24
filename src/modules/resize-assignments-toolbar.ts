// This is a utility module that resizes in the assignment center toolbar

import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

async function resizeToolbarMain() {
  await waitForLoad(() => document.querySelector('.col-md-4'));

  // bottom row
  const datebar = document.querySelectorAll('.col-md-4')[1];
  const buttonbar = document.querySelector('.col-md-8');
  datebar.classList.remove('col-md-4');
  datebar.classList.add('col-md-3');
  buttonbar.classList.remove('col-md-8');
  buttonbar.classList.add('col-md-9');

  // top row
  const rangebar = document.querySelector('.col-md-5');
  const mid = document.querySelector('.col-md-3');
  rangebar.classList.remove('col-md-5');
  rangebar.classList.add('col-md-6');
  mid.classList.remove('col-md-3');
  mid.classList.add('col-md-2');
}

export default registerModule('{8581eb62-2d14-4441-8c8c-620d7ea2663b}', {
  name: 'internal.resizeToolbar',
  main: resizeToolbarMain,
  showInOptions: false,
});
