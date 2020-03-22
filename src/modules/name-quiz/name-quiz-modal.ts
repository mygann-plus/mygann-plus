import storage from '~/utils/storage';

const NAME_QUIZ_KEY = 'name_quiz';
const SCHEMA_VERSION = 1;

/**
 * SCHEMA v1
 * {
 *  nicknames: {
 *    'Full Name \'20': 'Nickname'
 *  }
 * }
*/

export interface Nicknames {
  [fullName: string]: string;
}

async function getNameQuizData() {
  return (await storage.get(NAME_QUIZ_KEY, SCHEMA_VERSION)) || {};
}

export async function getNicknames(): Promise<Nicknames> {
  return ((await getNameQuizData()).nicknames) || {};
}

export async function setNickname(fullName: string, nickname: string) {
  const data = await getNameQuizData();
  storage.set(NAME_QUIZ_KEY, {
    ...data,
    nicknames: {
      ...data.nicknames,
      [fullName]: nickname,
    },
  }, SCHEMA_VERSION);
}

export async function removeNickname(fullName: string) {
  const data = await getNameQuizData();
  delete data.nicknames[fullName];
  storage.set(NAME_QUIZ_KEY, data, SCHEMA_VERSION);
}

export async function getMode() {
  return (await getNameQuizData()).mode;
}

export async function setMode(mode: string) {
  const data = await getNameQuizData();
  data.mode = mode;
  storage.set(NAME_QUIZ_KEY, data, SCHEMA_VERSION);
}
