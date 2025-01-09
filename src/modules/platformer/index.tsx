import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import createCanvas from './main';

function platformerMain() {
  createCanvas();
}

export default registerModule('{71488e60-41d0-47d4-bd03-5dfc4c6e1576}', {
  name: 'Platformer',
  description: 'Turn MyGann into a platformer game! Yellow boxes are jump platforms and green are normal platforms. Disable the game from the mygann+ settings.', // TODO: add a keybind or button to close the game.
  init: platformerMain,
  // unload: , // NOTE: i feel like this one does need an unloader, mainly deleting the canvas and clearing stuff. I think there's a function in main.tsx of the game to stop it all and delete it. need to stop intervals, delete all elements, etc.
  defaultEnabled: false,
});
