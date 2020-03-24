import classNames from 'classnames';

import { getAssetUrl } from '~/utils/assets';
import Flyout from '~/utils/flyout';
import { createElement, clearNode, constructButton } from '~/utils/dom';

import selectors from './selectors';
import { showAddDialog, showEditDialog } from './favorites-dialogs';
import { deleteSavedFavorite, Favorite } from './favorites-model';

import starIcon from './star-icon.png';

function handleAdd(event: Event) {
  event.preventDefault();
  showAddDialog();
}
function handleDelete(event: Event, id: string) {
  const button = event.target as HTMLElement;

  const favoritesMenu = button.closest('.subnav');
  const li = button.closest('li');
  favoritesMenu.classList.add(selectors.visibleMenu);
  li.classList.add(selectors.menuItem.highlight);

  const flyout = new Flyout(
    constructButton({
      textContent: 'Delete',
      onClick: e => {
        e.stopPropagation(); // prevent delete flyout being shown again
        deleteSavedFavorite(id);
        flyout.hide();
      },
    }), {
      onHide: () => {
        favoritesMenu.classList.remove(selectors.visibleMenu);
        li.classList.remove(selectors.menuItem.highlight);
      },
    },
  );

  flyout.showAtElem(button);
  flyout.getBody().focus();
}


function createLink(favorite: Favorite) {
  return (
    <li className={classNames(selectors.menuItem.link, selectors.menuItem.desktopLink)}>
      <a href={`#${favorite.hash}`} className="sec-25-bgc-hover">
        <span className="desc">
          <span className={classNames(selectors.menuItem.title, 'title black-fgc')}>
            {favorite.title}
          </span>
        </span>
      </a>
      <span className={selectors.controls}>
        <button onClick={() => showEditDialog(favorite.id)}>
          <i className="fa fa-edit" />
        </button>
        <button onClick={(e: any) => handleDelete(e, favorite.id)}>
          <i className="fa fa-trash"/>
        </button>
      </span>
    </li>
  );
}

export function createDesktopMenu() {
  const starIconUrl = getAssetUrl(starIcon);

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

export function setDesktopMenuList(menu: HTMLElement, favorites: Favorite[]) {
  const listWrap = menu.querySelector(`#${selectors.dropdown}`);
  const list = (
    <ul>
      { favorites.map(createLink) }
      <li>
        <a
          href="#"
          className="sec-25-bgc-hover"
          id={selectors.addButton}
          onClick={(e: any) => handleAdd(e)}
        >
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
