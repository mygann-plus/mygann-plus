import registerModule from '../utils/module';
import Dialog from '../utils/dialogue';
import storage, { deleteItem, changeItem, generateID } from '../utils/storage';
import { sanitizeHTMLString } from '../utils/string';
import { getAssetUrl } from '../utils/assets';
import {
  waitForLoad,
  createElementFromHTML,
  insertBefore,
  insertCss,
  addEventListeners,
} from '../utils/dom';

const identifiers = {
  dialog: {
    title: 'gocp_favorites_form-title',
    hash: 'gocp_favorites_form-hash',
  },
  control: {
    delete: 'gocp_favorites_delete-control',
    edit: 'gocp_favorites_edit-control',
  },
  addButton: 'gocp_favorites_addbutton',
};

// DATA MANIPULATION

let favoritesData = [];

async function getSavedFavorites() {
  return (await storage.get('favorites')) || [];
}

async function saveNewFavorite(favorite) {
  const savedFavorites = await getSavedFavorites();
  savedFavorites.push(favorite);
  storage.set({
    favorites: savedFavorites,
  });
}

async function deleteFavorite(id) {
  deleteItem('favorites', id);
  const link = document.querySelector(`li[data-gocp_favorites_id="${id}"]`);
  link.parentNode.removeChild(link);
}

async function editFavorite(id, newFavorite) {
  changeItem('favorites', id, () => newFavorite);
  const li = document.querySelector(`li[data-gocp_favorites_id="${id}"]`);
  li.children[0].children[0].children[0].innerText = newFavorite.title;
  li.children[0].href = `#${newFavorite.hash}`;
}

function getFavorite(id) {
  return favoritesData.filter(f => f.id === id)[0];
}

function favoriteToLink(favorite) {
  const title = sanitizeHTMLString(favorite.title);
  return `
    <li class="gocp_favorites_link" data-gocp_favorites_id="${favorite.id}">
      <a href="#${favorite.hash}" data-taskid="53179" class="sec-25-bgc-hover" data-spid="5">
        <span class="desc">
          <span class=" title black-fgc">${title}</span>
          <div 
            style="
              position: absolute;
              display: inline;
              right: 10px;
              bottom: 6px;
              background: rgba(255, 242, 192, 1);
              padding: 0 5px;
            " 
            class="gocp_favorites_controls"
          >
            <i class="fa fa-edit gocp_favorites_edit-control"></i>
            <i class="fa fa-trash gocp_favorites_delete-control"></i>
          </div>
        </span>
      </a>
    </li>
  `;
}

function addFavorite(favorite) {
  saveNewFavorite(favorite);
  const addPageLi = document.getElementById('gocp_favorites_addbutton').parentNode;
  insertBefore(addPageLi, createElementFromHTML(favoriteToLink(favorite)));
}

async function getLinksHtml() {
  favoritesData = await getSavedFavorites();
  return favoritesData.map(favoriteToLink).join('');
}

async function createMenu() {
  const starIconUrl = getAssetUrl('star_icon.png');
  const html = `
    <li class="oneline parentitem" id="gocp_favorites_menu">
      <a href="#" data-taskid="-5" class="subnavtrigger black-fgc" id="group-header-News">
        <img src="${starIconUrl}">
        <span class="desc">
          <span class="title pri-100-fgc">Favorites
          </span>
        </span>
        <span class="caret"></span>
      </a>
      <div class="subnavtop sec-75-bordercolor white-bgc"></div>
      <div class="subnav sec-75-bordercolor white-bgc" id="gocp_favorites_dropdown">
        <ul>
          ${await getLinksHtml()}
          <li class="">
            <a href="#" class="sec-25-bgc-hover" id="gocp_favorites_addbutton">
              <span class="desc">
                <span class=" title black-fgc">
                 <i class="fa fa-plus"></i>
                  Add Page
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  `;
  return createElementFromHTML(html);
}

function createDialogBody(favorite = {}) {
  const hash = favorite.hash || window.location.hash.split('#')[1] || '';
  const title = favorite.title || '';
  const html = `
    <form id="gocp_favorites_form">
      <div class="row">
        <div class="form-group col-md-12">
          <label class="control-label" for="textarea">Title</label>
          <div class="controls">
            <input 
              type="text" 
              class="form-control col-md-8" 
              id="${identifiers.dialog.title}" 
              value="${title}" 
              required 
              autofocus 
              autocomplete="off"
            > 
          </div>
        </div>
      </div>
      <div class="row">
        <div class="form-group col-md-12">
          <label class="control-label" for="textarea">Page</label>
          <div class="controls">
            <input 
              type="text" 
              class="form-control col-md-8" 
              id="${identifiers.dialog.hash}"
              value="${hash}" 
              required
            > 
          </div>
        </div>
        </div>
      </div>
    </form>
  `;
  return createElementFromHTML(html);
}

// CONTROLS

function getInputtedFavorite() {
  const form = document.getElementById('gocp_favorites_form');
  if (!form.reportValidity()) {
    // prevent dialog from closing
    return false;
  }

  const title = sanitizeHTMLString(document.getElementById(identifiers.dialog.title).value);
  const hash = document.getElementById(identifiers.dialog.hash).value;
  return { title, hash };
}

function handleAdd(event) {
  event.preventDefault();

  const handleSave = () => {
    const favorite = getInputtedFavorite();
    if (favorite === false) {
      return false;
    } else {
      favorite.id = generateID();
      addFavorite(favorite);
    }
  };

  const addDialog = new Dialog('Add Favorite', createDialogBody(), handleSave);
  addDialog.open();

}

function handleEdit(event) {
  event.preventDefault();

  const li = event.target.parentNode.parentNode.parentNode.parentNode;
  const id = li.getAttribute('data-gocp_favorites_id');
  const oldFavorite = getFavorite(id);

  const handleSave = () => {
    const newFavorite = getInputtedFavorite();
    if (newFavorite === false) {
      return false;
    } else {
      newFavorite.id = id;
      editFavorite(id, newFavorite);
    }
  };

  const dialog = new Dialog('Edit Favorite', createDialogBody(oldFavorite), handleSave);
  dialog.open();

}

function handleDelete(event) {
  event.preventDefault();
  const li = event.target.parentNode.parentNode.parentNode.parentNode;
  const id = li.getAttribute('data-gocp_favorites_id');

  if (window.confirm('Are you sure you want to delete this favorite?')) { // eslint-disable-line no-alert, max-len
    deleteFavorite(id);
  }

}

function addListeners() {
  /* eslint-disable max-len */
  document.getElementById(identifiers.addButton).addEventListener('click', handleAdd);
  addEventListeners(document.getElementsByClassName(identifiers.control.edit), 'click', handleEdit);
  addEventListeners(document.getElementsByClassName(identifiers.control.delete), 'click', handleDelete);
  /* eslint-enable max-len */
}

function insertControlStyle() {
  insertCss(`
    .gocp_favorites_controls > i {
      font-size: 15px;
      margin-right: 4px;
      background: #fff2c0;
      padding: 3px;
      color: black;
      display: none;
    }
    .gocp_favorites_link:hover .gocp_favorites_controls > i {
      display: inline;
    }
  `);
}

function favorites() {
  waitForLoad(() => document.querySelector('.topnav > .twoline.parentitem.last'))
    .then(async () => {
      if (document.getElementById('gocp_favorites_menu')) {
        return;
      }

      const menu = await createMenu();
      const directoriesMenu = document.querySelector('.topnav > .twoline.parentitem.last');

      insertBefore(directoriesMenu, menu);
      addListeners();
      insertControlStyle();
    });
}

export default registerModule('Favorites', favorites);
