import classNames from 'classnames';

import { getAssetUrl } from '~/utils/assets';
import Flyout from '~/utils/flyout';
import { createElement, clearNode, constructButton } from '~/utils/dom';

import selectors from './selectors';
import { showAddDialog, showEditDialog } from './favorites-dialogs';
import { deleteSavedFavorite } from './favorites-model';

import starIcon from './star-icon.png';

function handleDelete(event, id) {
  const favoritesMenu = event.target.closest('.subnav');
  const li = event.target.closest('li');
  favoritesMenu.classList.add(selectors.visibleMenu);
  li.classList.add(selectors.menuItem.highlight);

  const flyout = new Flyout(constructButton('Delete', '', '', () => {
    deleteSavedFavorite(id);
    flyout.hide();
  }), {
    onHide: () => {
      favoritesMenu.classList.remove(selectors.visibleMenu);
      li.classList.remove(selectors.menuItem.highlight);
    },
  });

  flyout.showAtElem(event.target);
  flyout.getBody().focus();
}


function createLink(favorite) {
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
        <button onClick={e => handleDelete(e, favorite.id)}>
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

export function setDesktopMenuList(menu, favorites) {
  const listWrap = menu.querySelector(`#${selectors.dropdown}`);
  const list = (
    <ul>
      { favorites.map(createLink) }
      <li>
        <a href="#" className="sec-25-bgc-hover" id={selectors.addButton} onClick={showAddDialog}>
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
