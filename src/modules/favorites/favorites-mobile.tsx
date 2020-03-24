import classNames from 'classnames';

import { createElement, clearNode, constructButton } from '~/utils/dom';
import { getAssetUrl } from '~/utils/assets';
import Flyout from '~/utils/flyout';

import selectors from './selectors';
import { showAddDialog, showEditDialog } from './favorites-dialogs';
import { deleteSavedFavorite, Favorite } from './favorites-model';

import starIcon from './star-icon.png';

function hideMenu() {
  (document.querySelector('#app') as HTMLElement).click();
}
function handleAdd(event: Event) {
  event.preventDefault();
  hideMenu();
  showAddDialog();
}
function handleEdit(id: string) {
  hideMenu();
  showEditDialog(id);
}

function handleDelete(event: Event, id: string) {
  const button = event.target as HTMLElement;
  const li = button.closest('li');
  li.classList.add(selectors.menuItem.highlight);

  const flyout = new Flyout(
    constructButton({
      textContent: 'Delete',
      onClick: () => {
        deleteSavedFavorite(id);
        flyout.hide();
      },
    }), {
      onHide: () => {
        li.classList.remove(selectors.menuItem.highlight);
      },
    },
  );

  flyout.showAtElem(button);
  flyout.getBody().focus();
}


function createLink(favorite: Favorite) {
  return (
    <li className={classNames(selectors.menuItem.link, selectors.menuItem.mobileLink)}>
      <a href={`#${favorite.hash}`} onClick={hideMenu}>
        {favorite.title}
      </a>
      <span className={selectors.controls}>
        <button onClick={() => handleEdit(favorite.id)}>
          <i className="fa fa-edit" />
        </button>
        <button onClick={(e: any) => handleDelete(e, favorite.id)}>
          <i className="fa fa-trash"/>
        </button>
      </span>
    </li>
  );
}

/**
 * MyGann's native mobile menu listeners are applied after createMobileMenu is called
 * However, it is neccessary to duplicate those listeners to support dynamic reloading
 */

function handleMenuLinkClick(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const target = e.target as HTMLElement;
  const menu = target.closest('.clearfix').querySelector('.app-mobile-level') as HTMLElement;
  menu.style.left = '0';
  menu.classList.add('open');
}
function handleBackLinkClick(e: Event) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  const target = e.target as HTMLElement;
  const menu = target.closest('.clearfix').querySelector('.app-mobile-level') as HTMLElement;
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
      <a href="#" data-taskid="-5" onClick={(e: any) => handleMenuLinkClick(e)}>
        <span className="iHolder pull-left ddd">
          <img src={starIconUrl} />
        </span>
        <span className="title">Favorites</span>
      </a>
      <div className={classNames('app-mobile-level', selectors.mobileMenu.submenu)}>
        <h2>Favorites</h2>
        <div className="app-mobile-back" onClick={(e: any) => handleBackLinkClick(e)}>
        <i className="p3icon-sideArrow pull-right"></i> back</div>
        <div id={selectors.mobileMenu.dropdown}>
          <ul />
        </div>
      </div>
    </li>
  );
}

export function setMobileMenuList(menu: HTMLElement, favorites: Favorite[]) {
  const listWrap = menu.querySelector(`#${selectors.mobileMenu.dropdown}`);
  const ul = (
    <ul>
      { favorites.map(createLink) }
      <li>
        <a href="#" onClick={(e: any) => handleAdd(e)}>
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
