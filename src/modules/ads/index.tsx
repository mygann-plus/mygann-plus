import registerModule from '~/core/module';
import { createElement } from '~/utils/dom';

import style from './style.css';

console.log(style);

const selectors = {
  
};

const video = (
<div id="wrapper">
  <div id="block"></div>
    <iframe
      src="https://www.youtube.com/embed/EUyNRDDjdpc?rel=0&modestbranding=1&autohide=1&mute=1&showinfo=0&controls=0&autoplay=1" // eslint-disable-line max-len
      frameBorder="0"></iframe>
</div>
);

function adsMain() {
  
}

export default registerModule('{1cb3afb6-1134-47e9-8cdf-57a94701460e}', {
  name: 'Ads',
  description: 'Show ads in mygann',
  init: adsMain,
});
