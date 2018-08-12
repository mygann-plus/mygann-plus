import classNames from 'classnames';

import { createElement, clearNode, constructButton } from '~/utils/dom';
import { getAssetUrl } from '~/utils/assets';
import Flyout from '~/utils/flyout';

import selectors from './selectors';
import { showAddDialog, showEditDialog } from './favorites-dialogs';
import { deleteSavedFavorite } from './favorites-model';

import starIcon from './star-icon.png';

function hideMenu() {
  document.querySelector('#app').click();
}
function handleAdd(event) {
  event.preventDefault();
  hideMenu();
  showAddDialog(event);
}
function handleEdit(id) {
  hideMenu();
  showEditDialog(id);
}

function handleDelete(event, id) {
  const li = event.target.closest('li');
  li.classList.add(selectors.menuItem.highlight);

  const flyout = new Flyout(constructButton('Delete', '', '', () => {
    deleteSavedFavorite(id);
    flyout.hide();
  }), {
    onHide: () => {
      li.classList.remove(selectors.menuItem.highlight);
    },
  });

  flyout.showAtElem(event.target);
  flyout.getBody().focus();
}


function createLink(favorite) {
  return (
    <li className={classNames(selectors.menuItem.link, selectors.menuItem.mobileLink)}>
      <a href={`#${favorite.hash}`} onClick={hideMenu}>
        {favorite.title}
      </a>
      <span className={selectors.controls}>
        <button onClick={() => handleEdit(favorite.id)}>
          <i className="fa fa-edit" />
        </button>
        <button onClick={e => handleDelete(e, favorite.id)}>
          <i className="fa fa-trash"/>
        </button>
      </span>
    </li>
  );
}

/**
 * OnCampus's native mobile menu listeners are applied after createMobileMenu is called
 * However, it is neccessary to duplicate those listeners to support dynamic reloading
 */

function handleMenuLinkClick(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const menu = e.target.closest('.clearfix').querySelector('.app-mobile-level');
  menu.style.left = '0';
  menu.classList.add('open');
}
function handleBackLinkClick(e) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  const menu = e.target.closest('.clearfix').querySelector('.app-mobile-level');
  menu.style.left = '-300px';
  menu.classList.remove('open');
}

export function createMobileMenu() {
  const starIconUrl = getAssetUrl(starIcon);

  return (
    <li className="clearfix">
      <i className={
        classNames('p3icon-thinArrowLeft p3formWhite pull-left', selectors.mobileMenu.arrow)
      }/>
      <a href="#" data-taskid="-5" onClick={handleMenuLinkClick}>
        <span className="iHolder pull-left ddd">
          <img src={starIconUrl} />
        </span>
        <span className="title">Favorites</span>
      </a>
      <div className="app-mobile-level">
        <h2>Favorites</h2>
        <div className="app-mobile-back" href="#" onClick={handleBackLinkClick}>
        <i className="p3icon-sideArrow pull-right"></i> back</div>
        <div id={selectors.mobileMenu.dropdown}>
          <ul />
        </div>
      </div>
    </li>
  );
}

export function setMobileMenuList(menu, favorites) {
  const listWrap = menu.querySelector(`#${selectors.mobileMenu.dropdown}`);
  const ul = (
    <ul>
      { favorites.map(createLink) }
      <li>
        <a href="#" onClick={handleAdd}>
          <span className="iHolder pull-left">
            <i className="fa fa-plus"></i>
          </span>
          Add Page
        </a>
      </li>
    </ul>
  );
  clearNode(listWrap);
  listWrap.appendChild(ul);
}
