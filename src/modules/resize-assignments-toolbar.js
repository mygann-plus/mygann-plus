// This is a utility module that resizes in the assignment center toolbar

import registerModule from '~/module';
import { waitForLoad } from '~/utils/dom';

async function resizeToolbar() {
  await waitForLoad(() => document.querySelector('.col-md-4'));

  const datebar = document.querySelectorAll('.col-md-4')[1];
  const buttonbar = document.querySelector('.col-md-8');
  datebar.classList.remove('col-md-4');
  datebar.classList.add('col-md-3');
  buttonbar.classList.remove('col-md-8');
  buttonbar.classList.add('col-md-9');
}

export default registerModule('{8581eb62-2d14-4441-8c8c-620d7ea2663b}', {
  name: 'internal.resizeToolbar',
  main: resizeToolbar,
  showInOptions: false,
});

