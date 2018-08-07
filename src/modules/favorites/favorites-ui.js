import classNames from 'classnames';

import { getAssetUrl } from '~/utils/assets';
import Dialog from '~/utils/dialog';
import { createElement, addEventListeners } from '~/utils/dom';

import {
  editSavedFavorite,
  getFavorite,
  deleteSavedFavorite,
  saveNewFavorite,
} from './favorites-model';
import selectors from './selectors';

function createLink(favorite) {
  return (
    <li className={selectors.menuItem.link} dataset={{ gocp_favorites_id: favorite.id }}>
      <a href={`#${favorite.hash}`} className="sec-25-bgc-hover">
        <span className="desc">
          <span className={classNames(selectors.menuItem.title, 'title black-fgc')}>
            {favorite.title}
          </span>
          <div className={selectors.control.wrap}>
            <i className={classNames('fa fa-edit', selectors.control.edit)}></i>
            <i className={classNames('fa fa-trash', selectors.control.delete)}></i>
          </div>
        </span>
      </a>
    </li>
  );
}

export async function createMenu(favorites) {
  const starIconUrl = getAssetUrl('star_icon.png');

  return (
    <li className="oneline parentitem">
      <a href="#" className="subnavtrigger black-fgc">
        <img src={starIconUrl} />
        <span className="desc">
          <span className="title pri-100-fgc sky-nav">Favorites
          </span>
        </span>
        <span className="caret"></span>
      </a>
      <div className="subnavtop sec-75-bordercolor white-bgc"></div>
      <div className="subnav sec-75-bordercolor white-bgc" id={selectors.dropdown}>
        <ul>
          { favorites.map(createLink) }
          <li className="">
            <a href="#" className="sec-25-bgc-hover" id={selectors.addButton}>
              <span className="desc">
                <span className="title black-fgc">
                 <i className="fa fa-plus"></i>
                 &nbsp;Add Page
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  );
}

export function createDialogBody(favorite = {}) {
  const hash = favorite.hash || window.location.hash.split('#')[1] || '';
  const title = favorite.title || '';
  return (
    <form id={selectors.form}>
      <div className="row">
        <div className="form-group col-md-12">
          <label className="control-label" htmlFor={selectors.dialog.title}>Title</label>
          <div className="controls">
            <input
              type="text"
              className="form-control col-md-8"
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

/* DOM MANIPULATORS */

function insertFavoriteNode(favorite) {
  const addPageLi = document.getElementById(selectors.addButton).parentNode;
  addPageLi.before(createLink(favorite));
  const favoriteLi = document.querySelector(`li[data-gocp_favorites_id="${favorite.id}"]`);

  /* editFavoriteNode needs to be before handleEdit, so fixing this issue would require having node
     manipulators in different places */
  /* eslint-disable no-use-before-define */
  favoriteLi.querySelector(`.${selectors.control.edit}`).addEventListener('click', handleEdit);
  favoriteLi.querySelector(`.${selectors.control.delete}`).addEventListener('click', handleDelete);
  /* eslint-enable no-use-before-define */
}

function editFavoriteNode(id, newFavorite) {
  const link = document.querySelector(`li[data-gocp_favorites_id="${id}"] > :first-child`);
  link.querySelector(`.${selectors.menuItem.title}`).textContent = newFavorite.title;
  link.href = `#${newFavorite.hash}`;
}

function deleteFavoriteNode(id) {
  const link = document.querySelector(`li[data-gocp_favorites_id="${id}"]`);
  link.parentNode.removeChild(link);
}

/* EVENT LISTENERS */

const idFromEvent = event => {
  const li = event.target.parentNode.parentNode.parentNode.parentNode;
  return li.getAttribute('data-gocp_favorites_id');
};

function getInputtedFavorite() {
  const form = document.getElementById(selectors.form);
  if (!form.reportValidity()) {
    // prevent dialog from closing
    return null;
  }

  const title = document.getElementById(selectors.dialog.title).value;
  const hash = document.getElementById(selectors.dialog.hash).value;
  return { title, hash };
}

async function handleEdit(event) {
  event.preventDefault();
  event.stopPropagation();

  const id = idFromEvent(event);
  const oldFavorite = await getFavorite(id);

  const handleSave = () => {
    const newFavorite = getInputtedFavorite();
    if (!newFavorite) {
      return false;
    } else {
      newFavorite.id = id;
      editSavedFavorite(id, newFavorite);
      editFavoriteNode(id, newFavorite);
    }
  };

  const dialog = new Dialog('Edit Favorite', createDialogBody(oldFavorite), {
    leftButtons: [
      {
        name: 'Save',
        primary: true,
        onClick: handleSave,
      },
      Dialog.buttons.CANCEL,
    ],
  });
  dialog.open();
  dialog.getBody().querySelector(`#${selectors.dialog.title}`).focus();

}

function handleAdd(event) {
  event.preventDefault();

  const handleDialogSave = () => {
    const favorite = getInputtedFavorite();
    if (!favorite) {
      return false;
    } else {
      saveNewFavorite(favorite);
      insertFavoriteNode(favorite);
    }
  };

  const addDialog = new Dialog('Add Favorite', createDialogBody(), {
    leftButtons: [
      {
        name: 'Add',
        primary: true,
        onClick: handleDialogSave,
      },
      Dialog.buttons.CANCEL,
    ],
  });
  addDialog.open();
  addDialog.getBody().querySelector(`#${selectors.dialog.title}`).focus();

}

function handleDelete(event) {
  event.preventDefault();
  event.stopPropagation();

  const id = idFromEvent(event);

  if (window.confirm('Are you sure you want to delete this favorite?')) { // eslint-disable-line no-alert, max-len
    deleteSavedFavorite(id);
    deleteFavoriteNode(id);
  }

}

export function addListeners() {
  /* eslint-disable max-len */
  document.getElementById(selectors.addButton).addEventListener('click', handleAdd);
  addEventListeners(document.getElementsByClassName(selectors.control.edit), 'click', handleEdit);
  addEventListeners(document.getElementsByClassName(selectors.control.delete), 'click', handleDelete);
  /* eslint-enable max-len */
}
