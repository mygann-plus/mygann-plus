import Dialog from '~/utils/dialog';

import { createElement } from '~/utils/dom';

import {
  editSavedFavorite,
  getFavorite,
  saveNewFavorite,
} from './favorites-model';
import selectors from './selectors';

function getHash() {
  return window.location.hash.split('#')[1] || '';
}

function createDialogBody({ hash = getHash(), title = '' }) {
  return (
    <form>
      <div className="row">
        <div className="form-group col-md-12">
          <label className="control-label" htmlFor={selectors.dialog.title}>Title</label>
          <div className="controls">
            <input
              type="text"
              className="form-control col-md-8"
              name={selectors.dialog.title}
              id={selectors.dialog.title}
              value={title}
              required
              autocomplete="off"
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-12">
          <label className="control-label" htmlFor={selectors.dialog.hash}>Page</label>
          <div className="controls">
            <input
              type="text"
              className="form-control col-md-8"
              name={selectors.dialog.hash}
              id={selectors.dialog.hash}
              value={hash}
              required
            />
          </div>
        </div>
      </div>
    </form>
  );
}

function showDialog(dialogTitle, primaryButtonName, state = {}) {
  return new Promise(res => {
    const form = createDialogBody(state);
    const dialog = new Dialog(dialogTitle, form, {
      leftButtons: [
        {
          name: primaryButtonName,
          primary: true,
          onClick() {
            if (!form.reportValidity()) {
              // prevent dialog from closin
              return false;
            }
            const title = form.elements[selectors.dialog.title].value;
            const hash = form.elements[selectors.dialog.hash].value;
            res({ title, hash });
          },
        },
        {
          type: Dialog.buttonTypes.LINK,
          name: 'Cancel',
          onClick() { res(null); },
        },
      ],
    });
    dialog.open();
    form.elements[selectors.dialog.title].focus();
  });
}

export async function handleAdd(event) {
  event.preventDefault();

  const newFavorite = await showDialog('Add Favorite', 'Add');
  if (!newFavorite) {
    return;
  }
  await saveNewFavorite(newFavorite);
}


export async function handleEdit(event, id) {
  event.preventDefault();
  event.stopPropagation();

  const oldFavorite = await getFavorite(id);
  const newFavorite = await showDialog('Edit Favorite', 'Save', oldFavorite);
  if (!newFavorite) {
    return;
  }
  await editSavedFavorite(id, {
    ...newFavorite,
    id,
  });
}
