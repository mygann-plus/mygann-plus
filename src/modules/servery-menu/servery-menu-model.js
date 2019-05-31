import { fetchJson } from '~/utils/fetch';

const SERVERY_MENU_URL = 'https://mygannplus-data.surge.sh/servery-menu/servery-menu.json'; // eslint-disable-line max-len
const SERVERY_MENU_SCHEMA = 1;
let serveryMenu = null;

async function getServeryMenu() {
  if (!serveryMenu) {
    serveryMenu = await fetchJson(SERVERY_MENU_URL);
  }
  if (serveryMenu.$schemaVersion !== SERVERY_MENU_SCHEMA) {
    return [];
  }
  return serveryMenu.data;
}

export default getServeryMenu;
