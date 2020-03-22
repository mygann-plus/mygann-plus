import { fetchData } from '~/utils/fetch';

const SERVERY_MENU_PATH = '/servery-menu/servery-menu.json'; // eslint-disable-line max-len
const SERVERY_MENU_SCHEMA = 1;

export interface ServeryMenuItem {
  name: string;
  parve?: boolean;
  gf?: boolean;
}

interface ServeryDayMenu {
  date: number;
  items: ServeryMenuItem[];
}

interface ServeryMonthMenu {
  year: number;
  month: number;
  link: string;
  menu: ServeryDayMenu[]
}

export type ServeryMenu = ServeryMonthMenu[];

let serveryMenu: ServeryMenu = null;

async function getServeryMenu() {
  if (!serveryMenu) {
    serveryMenu = await fetchData(SERVERY_MENU_PATH, SERVERY_MENU_SCHEMA);
  }
  return serveryMenu;
}

export default getServeryMenu;
