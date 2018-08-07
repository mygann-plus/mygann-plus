// Promise-based wrappers for chrome storage API

const SCHEMA_VERSION_KEY = '$schemaVersion';
const DATA_KEY = 'data';

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

const storage = {
  async get(property, schemaVersion, migrate) {
    const storedData = await doGet(property);
    let object = storedData[property];

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
  },

  set(key, value, schemaVersion) {
    return doSet({
      [key]: {
        [SCHEMA_VERSION_KEY]: schemaVersion,
        [DATA_KEY]: value,
      },
    });
  },
};

export default storage;

function warnType(id) {
  if (typeof id !== 'string') {
    console.warn(`ID should be a string, not a ${typeof id}`); // eslint-disable-line no-console
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

/**
 * @returns Added item's ID
 */
export async function addItem(key, newItem, schemaVersion) {
  const array = (await storage.get(key)) || [];
  newItem.id = generateID();
  array.push(newItem);
  storage.set(key, array, schemaVersion);
  return newItem.id;
}

export async function changeItem(key, id, reducer, schemaVersion) {
  warnType(id);
  // TODO: warn if item doesn't exist
  const array = (await storage.get(key)) || [];
  const newArray = reduceArray(array, id, reducer);
  storage.set(key, newArray, schemaVersion);
}

export async function deleteItem(key, id, schemaVersion) {
  warnType(id);
  const array = (await storage.get(key)) || [];
  const newArray = array.filter(assignment => (
    assignment.id !== id
  ));
  storage.set(key, newArray, schemaVersion);
}
