import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import createCanvas from './main';

function platformerMain() {
  console.log('placeholder');
  createCanvas()
}

export default registerModule('{50310672-9670-48a4-8261-2868a426ace6}', {
  name: 'Platformer',
  description: 'its a platformer bitch',
  init: platformerMain,
  // unload: unloadMyDayShortcut,
  defaultEnabled: true,
});
