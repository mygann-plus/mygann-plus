import registerModule from '~/core/module';
import { getAssetUrl } from '~/utils/assets';

import song from './music.mp3';

function musicMain() {
  const audioURL = getAssetUrl(song);
  const audio = new Audio(audioURL);
  audio.loop = true;
  audio.play();
}

export default registerModule('{1cb3afb6-1134-47e9-8cdf-57a94701460e}', {
  name: 'Music music music',
  description: 'Music music music music music music music music music music music music music',
  init: musicMain,
});
