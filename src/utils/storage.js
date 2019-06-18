import cloneDeep from 'lodash.clonedeep';

import log from '~/utils/log';
import { isBookmarklet } from '~/utils/bookmarklet';

// Promise-based wrappers for chrome storage API

const SCHEMA_VERSION_KEY = '$schemaVersion';
const DATA_KEY = 'data';

// INTERNALS

const listeners = new Map();

function callListeners(key, oldValue, newValue) {
  const keyListeners = listeners.get(key) || [];
  if (!keyListeners.length) {
    return;
  }
  const data = {
    newValue: newValue[DATA_KEY],
    oldValue: oldValue &&
      oldValue[SCHEMA_VERSION_KEY] !== newValue[SCHEMA_VERSION_KEY] ?
      null :
      oldValue[DATA_KEY],
  };
  keyListeners.forEach(listener => listener(cloneDeep(data)));
}

if (!isBookmarklet()) {
  chrome.storage.onChanged.addListener(changes => {
    for (const key in changes) {
      const change = changes[key];
      callListeners(key, change.oldValue, change.newValue);
    }
  });
}

function doGet(property) {
  return new Promise((resolve, reject) => {
    if (isBookmarklet()) {
      resolve(JSON.parse(localStorage.getItem(property)));
    } else {
      chrome.storage.sync.get(property, data => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(data[property]);
      });
    }
  });
}

function doSet(data) {
  return new Promise(async (resolve, reject) => {
    if (isBookmarklet()) {
      for (const key in data) {
        const oldValue = await doGet(key);
        localStorage.setItem(key, JSON.stringify(data[key]));
        callListeners(key, oldValue, data[key]);
        resolve();
      }
    } else {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    }
  });
}

function doDelete(property) {
  return new Promise((resolve, reject) => {
    if (isBookmarklet()) {
      localStorage.removeItem(property);
      resolve();
    } else {
      chrome.storage.sync.remove(property, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    }
  });
}

function warnType(id) {
  if (typeof id !== 'string') {
    log('warn', `ID should be a string, not a ${typeof id}`);
  }
}

function warnSchema(schemaVersion) {
  if (typeof schemaVersion !== 'number') {
    log('warn', `Schema Version should be a number, not a ${typeof schemaVersion}`);
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
  warnSchema(schemaVersion);
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
  warnSchema(schemaVersion);
  return doSet({
    [key]: {
      [SCHEMA_VERSION_KEY]: schemaVersion,
      [DATA_KEY]: value,
    },
  });
}

async function getArray(key, schemaVersion, migrateItem) {
  warnSchema(schemaVersion);
  const migrate = (oldSchema, oldData) => oldData.map(d => migrateItem(oldSchema, d));
  return (await get(key, schemaVersion, migrateItem && migrate)) || [];
}

/**
 * @returns Added item's ID
 */
async function addArrayItem(key, newItem, schemaVersion, migrateItem) {
  warnSchema(schemaVersion);
  const array = await getArray(key, schemaVersion, migrateItem);
  let id;
  if (newItem.id) {
    warnType(newItem.id);
    id = newItem.id; // eslint-disable-line prefer-destructuring
  } else {
    id = generateID();
  }
  const item = { ...newItem, id };
  array.push(item);
  await set(key, array, schemaVersion);
  return item;
}

async function changeArrayItem(key, id, reducer, schemaVersion, migrateItem) {
  warnSchema(schemaVersion);
  warnType(id);
  // TODO: warn if item doesn't exist
  const array = await getArray(key, schemaVersion, migrateItem);
  const newArray = reduceArray(array, id, reducer);
  await set(key, newArray, schemaVersion);
}

async function addOrChangeArrayItem(key, id, reducer, schemaVersion, migrateItem) {
  warnSchema(schemaVersion);
  const array = await getArray(key, schemaVersion, migrateItem);
  const item = array.find(i => i.id === id);
  if (!item) {
    return addArrayItem(key, reducer(null), schemaVersion, migrateItem);
  }
  warnType(id);
  return changeArrayItem(key, id, reducer, schemaVersion, migrateItem);
}

async function deleteArrayItem(key, id, schemaVersion, migrateItem) {
  warnSchema(schemaVersion);
  warnType(id);
  const array = await getArray(key, schemaVersion, migrateItem);
  const newArray = array.filter(assignment => (
    assignment.id !== id
  ));
  await set(key, newArray, schemaVersion);
}

function addChangeListener(key, listener) {
  if (!listeners.get(key)) {
    listeners.set(key, []);
  }
  const keyListeners = listeners.get(key);
  keyListeners.push(listener);
  return {
    remove: () => keyListeners.splice(keyListeners.indexOf(listener), 1),
  };
}

export default {
  get,
  set,

  getArray,
  addArrayItem,
  changeArrayItem,
  addOrChangeArrayItem,
  deleteArrayItem,

  addChangeListener,
};

