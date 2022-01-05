import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement, waitForOne, constructButton, insertCss } from '~/utils/dom';
import Flyout from '~/utils/flyout';
import DropdownMenu from '~/utils/dropdown-menu';
import { addDayChangeListeners } from '~/shared/schedule';

import {
  ZoomLinks,
  getZoomLinks,
  getZoomLink,
  setZoomLink,
  addZoomLinksChangeListener,
  removeZoomLink,
} from './zoom-links-model';
import style from './style.css';
import isSchoolEvent from '~/utils/school-events';

const selectors = {
  zoomColumn: 'mgp__zoom-links__zoomColumn',
  zoomHeader: 'mgp__zoom-links__zoomHeader',
  zoomLink: 'mgp__zoom-links__link',
  openButton: {
    button: style.locals.open__button,
    dropdown: style.locals.open__dropdown,
  },
  editFlyout: {
    linkInput: style.locals['edit__link-input'],
    saveButton: style.locals['edit__save-button'],
  },
};

const domQuery = {
  scheduleHeader: () => document.querySelector('.schedule-list thead tr'),
  scheduleRows: () => document.querySelectorAll('#accordionSchedules tr'),
};

function getClassIdFromRow(row: Element) {
  const link = row.querySelector('[data-heading="Activity"] a') as HTMLAnchorElement;
  return link?.hash.split('/')[1];
}

function getZoomIdFromUrl(url: string) {
  const idRegex = /j\/([^/?]+)/;

  if (!url.includes('zoom.us/j')) {
    return null;
  }

  const [path] = url.trim().split('zoom.us/').slice(-1);
  const match = path.match(idRegex);
  if (!match) {
    return null;
  }

  return match[1];
}

function createEditFlyout(id: string, link: string) {

  const handleSaveClick = (flyout: Flyout) => {
    const newLink = flyout.getBody().querySelector('textarea').value;
    setZoomLink(id, newLink);
    flyout.hide();
  };

  const flyout = new Flyout((
    <div>
      <textarea
        className={selectors.editFlyout.linkInput}
        placeholder="Zoom Link"
        value={link}
      />
      {
        constructButton({
          textContent: 'Save',
          onClick: () => handleSaveClick(flyout),
          className: selectors.editFlyout.saveButton,
          small: true,
        })
      }
    </div>
  ));
  return flyout;
}

/* OPEN BUTTON */

function handleOpenClick(link: string) {
  const id = getZoomIdFromUrl(link);

  if (id) {
    // Directly open zoom client
    window.open(`zoommtg://zoom.us/join?confno=${id}`);
  } else {
    // fallback if unable to parse ID
    window.open(link);
  }
}

function handleEditClick(id: string, link: string, button: HTMLElement) {
  const flyout = createEditFlyout(id, link);
  flyout.showAtElem(button);
}

function handleRemoveClick(id: string) {
  removeZoomLink(id);
}

function createOpenZoomLinkButton(id: string, link: string, isFound: boolean) {
  const button = constructButton({
    textContent: 'Open Zoom',
    onClick: () => handleOpenClick(link),
    className: selectors.openButton.button,
  });
  const dropdown: DropdownMenu = new DropdownMenu([
    {
      title: 'Edit Link',
      onclick: () => handleEditClick(id, link, button),
    },
    {
      title: isFound ? 'Link found with MyGann+' : 'Remove Link',
      onclick: isFound ? null : () => handleRemoveClick(id),
      style: isFound ? { fontStyle: 'italic', pointerEvents: 'none' } : null,
    },
  ], {
    buttonIconClassname: 'fa fa-chevron-down',
    buttonClassname: selectors.openButton.dropdown,
  });
  return <div className={selectors.zoomLink}>{button}{dropdown.getDropdownWrap()}</div>;
}

/* ADD BUTTON */

function handleAddClick(e: Event, id: string) {
  e.preventDefault();
  const addFlyout = createEditFlyout(id, '');
  addFlyout.showAtElem(e.target as HTMLElement);
}

function createAddZoomLinkButton(id: string) {
  const link = (
    <a
      href="#"
      className={selectors.zoomLink}
      onClick={(e: any) => handleAddClick(e, id)}
    >
      Add Zoom Link
    </a>
  );
  return link;
}

async function addHeaderColumn() {
  const header = domQuery.scheduleHeader();
  const zoomColumnHeader = <th className={selectors.zoomHeader}>Zoom</th>;
  header.appendChild(zoomColumnHeader);
}

async function insertZoomLinks(links: ZoomLinks) {
  const scheduleRows = await waitForOne(domQuery.scheduleRows);

  const existingZoomHeader = document.querySelector(`.${selectors.zoomHeader}`);
  if (existingZoomHeader) {
    return;
  }

  addHeaderColumn();

  // schedule sometimes renders multiple times, which removes zoom links
  const reinsert = (link: HTMLElement) => {
    if (!document.body.contains(link)) {
      insertZoomLinks(links);
    }
  };

  let firstZoomColumn: HTMLElement; // store first column, for reinsertion

  for (const row of scheduleRows) {
    const id = getClassIdFromRow(row);
    if (!id) continue; // basically if it was a free block
    // no await so it doesn't block the
    getZoomLink(id, links).then(link => {
      let button;
      if (link) {
        button = createOpenZoomLinkButton(id, link, !links[id]);
      } else {
        button = createAddZoomLinkButton(id);
      }
      const zoomColumn = <td className={selectors.zoomColumn}>{button}</td>;
      firstZoomColumn = firstZoomColumn || zoomColumn;
      row.appendChild(zoomColumn);
    });
  }

  for (let i = 0; i < 20; i++) {
    setTimeout(() => reinsert(firstZoomColumn), i * 50);
  }
}

// Element removal is in unload (vs unloadercontext) so it can be called on rerender
async function unloadZoomLinks() {
  const elems = document.querySelectorAll(`.${selectors.zoomLink}, .${selectors.zoomColumn}, .${selectors.zoomHeader}`);
  for (const element of elems) {
    element.remove();
  }
}

async function zoomLinksMain(opts: zoomLinksSuboptions, unloaderContext: UnloaderContext) {
  if (!opts.alwaysOn && !await isSchoolEvent('zoomSchool')) return; // only add zoom links if the user said to or its zoom school

  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  let links = await getZoomLinks();

  insertZoomLinks(links);
  const listener = addDayChangeListeners(() => insertZoomLinks(links));
  unloaderContext.addRemovable(listener);

  addZoomLinksChangeListener(newLinks => {
    links = newLinks;
    unloadZoomLinks();
    insertZoomLinks(links);
  });
}

interface zoomLinksSuboptions {
  alwaysOn: boolean,
}

export default registerModule('{3dcf8f0c-2b54-4e28-bffa-d12c6a6e8a3a}', {
  name: 'Zoom Links',
  main: zoomLinksMain,
  unload: unloadZoomLinks,
  suboptions: {
    alwaysOn: {
      name: 'Always show zoom links',
      type: 'boolean',
      defaultValue: false,
    },
  },
});
