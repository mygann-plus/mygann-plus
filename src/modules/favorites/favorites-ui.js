import classNames from 'classnames';

import { getAssetUrl } from '~/utils/assets';
import Dialog from '~/utils/dialog';
import Flyout from '~/utils/flyout';
import { createElement, constructButton, clearNode } from '~/utils/dom';

import {
  editSavedFavorite,
  getFavorite,
  deleteSavedFavorite,
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

async function handleAdd(event) {
  event.preventDefault();

  const newFavorite = await showDialog('Add Favorite', 'Add');
  if (!newFavorite) {
    return;
  }
  await saveNewFavorite(newFavorite);
}


async function handleEdit(event, id) {
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

function handleDelete(event, id) {
  event.preventDefault();
  event.stopPropagation();

  const favoritesMenu = event.target.closest('.subnav');
  favoritesMenu.classList.add(selectors.visibleMenu);

  const flyout = new Flyout(constructButton('Delete', '', '', () => {
    deleteSavedFavorite(id);
    flyout.hide();
  }), {
    onHide: () => {
      favoritesMenu.classList.remove(selectors.visibleMenu);
    },
  });

  const menuTitle = event.target
    .closest(`.${selectors.menuItem.link}`)
    .querySelector(`.${selectors.menuItem.title}`);

  flyout.showAtElem(menuTitle);
  flyout.getBody().focus();
}

function createLink(favorite) {
  return (
    <li className={selectors.menuItem.link} dataset={{ gocp_favorites_id: favorite.id }}>
      <a href={`#${favorite.hash}`} className="sec-25-bgc-hover">
        <span className="desc">
          <span className={classNames(selectors.menuItem.title, 'title black-fgc')}>
            {favorite.title}
          </span>
          <div className={selectors.control.wrap}>
            <i
              className={classNames('fa fa-edit', selectors.control.edit)}
              onClick={e => handleEdit(e, favorite.id)}
            />
            <i
              className={classNames('fa fa-trash', selectors.control.delete)}
              onClick={e => handleDelete(e, favorite.id)}
            />
          </div>
        </span>
      </a>
    </li>
  );
}


export function createMenu() {
  const starIconUrl = getAssetUrl('star_icon.png');

  return (
    <li className="oneline parentitem" id={selectors.menu}>
      <a href="#" className="subnavtrigger black-fgc">
        <img src={starIconUrl} />
        <span className="desc">
          <span className="title pri-100-fgc sky-nav">
            Favorites
          </span>
        </span>
        <span className="caret" />
      </a>
      <div className="subnavtop sec-75-bordercolor white-bgc">
        { /* This div is the arrow on top of the menu */ }
      </div>
      <div className="subnav sec-75-bordercolor white-bgc" id={selectors.dropdown} />
    </li>
  );
}

export function setMenuList(menu, favorites) {
  const listWrap = menu.querySelector(`#${selectors.dropdown}`);
  const list = (
    <ul>
      { favorites.map(createLink) }
      <li>
        <a href="#" className="sec-25-bgc-hover" id={selectors.addButton} onClick={handleAdd}>
          <span className="desc">
            <span className="title black-fgc">
              <i className="fa fa-plus" />
              &nbsp;Add Page
            </span>
          </span>
        </a>
      </li>
    </ul>
  );
  clearNode(listWrap);
  listWrap.appendChild(list);
}
