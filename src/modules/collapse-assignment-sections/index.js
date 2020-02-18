import classNames from 'classnames';

import registerModule from '~/module';

import { createElement, waitForOne, insertCss } from '~/utils/dom';
import { addProgressDialogListener } from '~/shared/progress';

import style from './style.css';
import { toggleSectionHidden, getIsHidden } from './collapse-assignment-sections-model';

const selectors = {
  button: 'gocp_collapse-assignment-sections_button',
  collapseLink: style.locals['collapse-link'],
  tableHeaderArrow: style.locals['table-header-arrow'],
  hiddenTable: style.locals['hidden-table'],
};

const buttonPositions = {
  tableHeaderArrow: 'tableHeaderArrow',
  collapseLink: 'collapseLink',
};

const getCourseName = () => document.querySelector('.media-heading').textContent;

const toggleTable = table => table.classList.toggle(selectors.hiddenTable);
const toggleTableBody = table => toggleTable(table.querySelector('tbody'));

function handleCollapseLinkClick(e, table, id) {
  e.stopPropagation();
  const { target: link } = e;
  table.classList.toggle(selectors.hiddenTable);
  if (link.textContent === 'Collapse') {
    link.textContent = 'Expand';
  } else {
    link.textContent = 'Collapse';
  }
  toggleSectionHidden(id, getCourseName());
}

function addCollapseLink(table, id, isHidden) {
  const link = (
    <h6
      className={ classNames(selectors.collapseLink, selectors.button) }
      onClick={ e => handleCollapseLinkClick(e, table, id) }
    >
      { isHidden ? 'Expand' : 'Collapse' }
    </h6>
  );
  const backToTop = table.previousSibling.querySelector('.back-to-top');
  backToTop.prepend(link);
  return link;
}

function handleTableHeaderArrowClick(e, table, id) {
  const { target: icon } = e;
  icon.classList.toggle('fa-chevron-up');
  icon.classList.toggle('fa-chevron-down');
  table.querySelector('tbody').classList.toggle(selectors.hiddenTable);
  toggleSectionHidden(id, getCourseName());
}

function addTableHeaderArrow(table, id, isHidden) {
  const notesHeader = table.querySelector('thead th:last-child');
  const chevronClassname = isHidden ? 'fa-chevron-up' : 'fa-chevron-down';
  const button = (
    <i
      className={classNames('fa', chevronClassname, selectors.tableHeaderArrow, selectors.button)}
      onClick={ e => handleTableHeaderArrowClick(e, table, id) }
    />
  );
  notesHeader.appendChild(button);
  return button;
}

async function addCollapseButtons(buttonPosition, unloaderContext) {
  const tables = await waitForOne(() => document.querySelectorAll('.modal-body table'));

  const hiddenMap = await Promise.all(Array.from(tables).map(table => {
    const { id } = table.previousSibling;
    return getIsHidden(id, getCourseName());
  }));

  const existingButtons = document.querySelectorAll(`.${selectors.button}`);
  if (existingButtons.length) {
    return;
  }

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];

    const { id } = table.previousSibling;
    const isHidden = hiddenMap[i];

    const button = buttonPosition === buttonPositions.collapseLink
      ? addCollapseLink(table, id, isHidden)
      : addTableHeaderArrow(table, id, isHidden);
    unloaderContext.addRemovable(button);

    if (isHidden) {
      if (buttonPosition === buttonPositions.collapseLink) {
        toggleTable(table);
      } else {
        toggleTableBody(table);
      }
    }
  }
}

function collapseAssignmentSections(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  addProgressDialogListener(() => {
    addCollapseButtons(suboptions.buttonPosition, unloaderContext);
  }, unloaderContext);
}

export default registerModule('{83201f77-2bb8-4f92-a09d-1d113066214c}', {
  name: 'Collapse Assignment Sections',
  main: collapseAssignmentSections,
  suboptions: {
    buttonPosition: {
      type: 'enum',
      name: 'Button Position',
      defaultValue: buttonPositions.tableHeaderArrow,
      enumValues: {
        [buttonPositions.collapseLink]: 'Collapse Link',
        [buttonPositions.tableHeaderArrow]: 'Table Header Arrow',
      },
    },
  },
});
