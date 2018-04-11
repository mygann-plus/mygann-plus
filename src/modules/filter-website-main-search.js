import { waitForLoad } from '../utils/dom';

export default function filterWebsiteMainSearch() {
  waitForLoad(() => document.getElementsByClassName('bb-tile-title')[0])
    .then(() => {
      document.getElementsByClassName('bb-tile-title')[0].parentNode.children[1].style.height = '0px';
      document.getElementsByClassName('bb-tile-title')[0].click();
      // TODO: make these three methods different options
      // move to bottom:
      // const elem = document.getElementsByClassName('bb-tile-title')[0].parentNode;
      // const parent = document.getElementById('search_summary_results');
      // parent.appendChild(elem);
      // remove:
      // parent.removeChild(elem);
    });
}
