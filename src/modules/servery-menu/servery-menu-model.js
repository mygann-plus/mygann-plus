import { fetchData } from '~/utils/fetch';

const SERVERY_MENU_PATH = '/servery-menu/servery-menu.json'; // eslint-disable-line max-len
const SERVERY_MENU_SCHEMA = 1;
let serveryMenu = null;

async function getServeryMenu() {
  if (!serveryMenu) {
    serveryMenu = await fetchData(SERVERY_MENU_PATH, SERVERY_MENU_SCHEMA);
  }
  return serveryMenu;
}

export default getServeryMenu;
