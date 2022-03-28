import storage from '~/utils/storage';

const THEME_KEY = 'theme';
const SCHEMA_VERSION = 1;

/*
{
  history: [
    '#color1',
    '#color2',
    '#color-etc...',
  ],
}
*/

interface ThemeModel {
  history: string[];
}

async function getData(): Promise<ThemeModel> {
  const data = await storage.get(THEME_KEY, SCHEMA_VERSION);
  return data || {};
}

export async function getThemeHistory() {
  const data = await getData();
  return data.history || [];
}

export async function setLastThemeColor(color: string) {
  const data = await getData();
  if (!data.history) data.history = [];
  else if (data.history.includes(color)) data.history.splice(data.history.indexOf(color), 1); // basically move it to beginning
  data.history.unshift(color);
  return storage.set(THEME_KEY, data, SCHEMA_VERSION);
}
