import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const HIDE_FORMS_KEY = 'hide-forms';
const FORM_ID_KEY = 'formId';

function getIds(array) {
  return array.map(item => {
    return parseInt(item[FORM_ID_KEY], 10);
  });
}

export async function getHiddenForms() {
  return getIds(await storage.getArray(HIDE_FORMS_KEY, SCHEMA_VERSION));
}

export function addHiddenForm(id) {
  return storage.addArrayItem(HIDE_FORMS_KEY, { [FORM_ID_KEY]: id }, SCHEMA_VERSION);
}

export async function deleteHiddenForm(id) {
  const forms = await storage.getArray(HIDE_FORMS_KEY, SCHEMA_VERSION);
  const internalId = forms.find(f => parseInt(f[FORM_ID_KEY], 10) === id).id;
  return storage.deleteArrayItem(HIDE_FORMS_KEY, internalId, SCHEMA_VERSION);
}

export function addHiddenFormsChangeListener(callback) {
  return storage.addChangeListener(HIDE_FORMS_KEY, ({ oldValue, newValue }) => {
    callback({
      oldValue: getIds(oldValue),
      newValue: getIds(newValue),
    });
  });
}
