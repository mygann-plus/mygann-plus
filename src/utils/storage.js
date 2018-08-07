import log from '~/utils/log';

// Promise-based wrappers for chrome storage API

const SCHEMA_VERSION_KEY = '$schemaVersion';
const DATA_KEY = 'data';

// INTERNAL UTILITIES

function doGet(property) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(property, data => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(data[property]);
    });
  });
}

function doSet(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

function doDelete(property) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(property, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

function warnType(id) {
  if (typeof id !== 'string') {
    log('warn', `ID should be a string, not a ${typeof id}`); // eslint-disable-line no-console
  }
}

function reduceArray(data, id, reducer) {
  return data.map(item => {
    if (item.id === id) {
      return reducer(item);
    }
    return item;
  });
}

function generateID() {
  return String(Math.floor(Math.random() * 1000000));
}

// PUBLIC API

async function get(property, schemaVersion, migrate) {
  let object = await doGet(property);
  if (!object) {
    return null;
  }

  const savedSchemaVersion = object[SCHEMA_VERSION_KEY];
  const savedData = object[DATA_KEY];
  if (schemaVersion !== savedSchemaVersion) {
    if (migrate) {
      object = {
        [SCHEMA_VERSION_KEY]: schemaVersion,
        [DATA_KEY]: migrate(savedSchemaVersion, savedData),
      };
      await doSet({ [property]: object });
    } else {
      await doDelete(property);
      return null;
    }
  }

  return object[DATA_KEY];
}

function set(key, value, schemaVersion) {
  return doSet({
    [key]: {
      [SCHEMA_VERSION_KEY]: schemaVersion,
      [DATA_KEY]: value,
    },
  });
}

async function getArray(key, schemaVersion, migrateItem) {
  const migrate = (oldSchema, oldData) => oldData.map(d => migrateItem(oldSchema, d));
  return (await get(key, schemaVersion, migrateItem && migrate)) || [];
}

/**
 * @returns Added item's ID
 */
async function addArrayItem(key, newItem, schemaVersion, migrateItem) {
  const array = await getArray(key, schemaVersion, migrateItem);
  const item = { ...newItem, id: generateID() };
  array.push(item);
  await set(key, array, schemaVersion);
  return item;
}

async function changeArrayItem(key, id, reducer, schemaVersion, migrateItem) {
  warnType(id);
  // TODO: warn if item doesn't exist
  const array = await getArray(key, schemaVersion, migrateItem);
  const newArray = reduceArray(array, id, reducer);
  await set(key, newArray, schemaVersion);
}

async function deleteArrayItem(key, id, schemaVersion, migrateItem) {
  warnType(id);
  const array = await getArray(key, schemaVersion, migrateItem);
  const newArray = array.filter(assignment => (
    assignment.id !== id
  ));
  await set(key, newArray, schemaVersion);
}

export default {
  get,
  set,

  getArray,
  addArrayItem,
  changeArrayItem,
  deleteArrayItem,
};

