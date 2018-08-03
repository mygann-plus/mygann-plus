// Promise-based wrappers for chrome storage API

const storage = {
  get: function get(property, doSync = true) {
    return new Promise(resolve => {
      const handleGet = value => resolve(value[property]);
      if (doSync) {
        chrome.storage.sync.get(property, handleGet);
      } else {
        chrome.storage.local.set(property, handleGet);
      }
    });
  },

  set: function set(property, doSync = true) {
    return new Promise(resolve => {
      if (doSync) {
        chrome.storage.sync.set(property, resolve);
      } else {
        chrome.storage.local.set(property, resolve);
      }
    });
  },
};

export default storage;

function warnType(id) {
  if (typeof id !== 'string') {
    console.warn(`ID should be a string, not a ${typeof id}`); // eslint-disable-line no-console
  }
}

export function reduceArray(data, id, reducer) {
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
export async function addItem(key, newItem) {
  const array = await storage.get(key);
  newItem.id = generateID();
  array.push(newItem);
  storage.set({ [key]: array });
  return newItem.id;
}

export async function changeItem(key, id, reducer) {
  warnType(id);
  // TODO: warn if item doesn't exist
  const array = await storage.get(key) || [];
  const newArray = reduceArray(array, id, reducer);
  storage.set({ [key]: newArray });
}

export async function addOrChangeItem(key, id, reducer) {
  warnType(id);
  const array = await storage.get(key) || [];
  if (!array.find(e => e.id === id)) {
    return addItem(key, reducer());
  }
  return changeItem(key, id, reducer);
}

export async function deleteItem(key, id) {
  warnType(id);
  const array = await storage.get(key) || [];
  const newArray = array.filter(assignment => (
    assignment.id !== id
  ));
  storage.set({ [key]: newArray });
}
