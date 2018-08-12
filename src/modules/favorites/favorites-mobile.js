import classNames from 'classnames';

import { createElement, clearNode, constructButton } from '~/utils/dom';
import { getAssetUrl } from '~/utils/assets';
import Flyout from '~/utils/flyout';

import selectors from './selectors';
import { showAddDialog, showEditDialog } from './favorites-dialogs';
import { deleteSavedFavorite } from './favorites-model';

function handleEdit(id) {
  document.querySelector('#app').click(); // hide menu
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
      <a href={`#${favorite.hash}`}>
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

export function createMobileMenu() {
  const starIconUrl = getAssetUrl('star_icon.png');

  return (
    <li className="clearfix">
      <i className={
        classNames('p3icon-thinArrowLeft p3formWhite pull-left', selectors.mobileMenu.arrow)
      }/>
      <a href="#" data-taskid="-5" id="mobile-group-header-News">
        <span className="iHolder pull-left ddd">
          <img src={starIconUrl} />
        </span>
        <span className="title">Favorites</span>
      </a>
      <div className="app-mobile-level">
        <h2>Favorites</h2>
        <div className="app-mobile-back" href="#">
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
        <a href="#" onClick={showAddDialog}>
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
