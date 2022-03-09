import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

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

const toggleTable = (table: HTMLElement) => table.classList.toggle(selectors.hiddenTable);
const toggleTableBody = (table: HTMLElement) => toggleTable(table.querySelector('tbody'));

function handleCollapseLinkClick(e: Event, table: HTMLElement, id: string) {
  e.stopPropagation();
  const link = e.target as HTMLElement;
  table.classList.toggle(selectors.hiddenTable);
  if (link.textContent === 'Collapse') {
    link.textContent = 'Expand';
  } else {
    link.textContent = 'Collapse';
  }
  toggleSectionHidden(id, getCourseName());
}

function addCollapseLink(table: HTMLElement, id: string, isHidden: boolean) {
  const link = (
    <h6
      className={ classNames(selectors.collapseLink, selectors.button) }
      onClick={ (e: any) => handleCollapseLinkClick(e, table, id) }
    >
      { isHidden ? 'Expand' : 'Collapse' }
    </h6>
  );
  const backToTop = (table.previousSibling as HTMLElement).querySelector('.back-to-top');
  backToTop.prepend(link);
  return link;
}

function handleTableHeaderArrowClick(e: Event, table: HTMLElement, id: string) {
  const icon = e.target as HTMLElement;
  icon.classList.toggle('fa-chevron-up');
  icon.classList.toggle('fa-chevron-down');
  table.querySelector('tbody').classList.toggle(selectors.hiddenTable);
  toggleSectionHidden(id, getCourseName());
}

function addTableHeaderArrow(table: HTMLElement, id: string, isHidden: boolean) {
  const notesHeader = table.querySelector('thead th:last-child');
  const chevronClassname = isHidden ? 'fa-chevron-up' : 'fa-chevron-down';
  const button = (
    <i
      className={classNames('fa', chevronClassname, selectors.tableHeaderArrow, selectors.button)}
      onClick={ (e: any) => handleTableHeaderArrowClick(e, table, id) }
    />
  );
  notesHeader.appendChild(button);
  return button;
}

async function addCollapseButtons(buttonPosition: string, unloaderContext: UnloaderContext) {
  const tables = await waitForOne(() => document.querySelectorAll('.modal-body table'));

  const hiddenMap = await Promise.all(Array.from(tables, table => {
    const { id } = table.previousSibling as HTMLElement;
    return getIsHidden(id, getCourseName());
  }));

  const existingButtons = document.querySelectorAll(`.${selectors.button}`);
  if (existingButtons.length) {
    return;
  }

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];

    const { id } = table.previousSibling as HTMLElement;
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

function collapseAssignmentSectionsMain(
  suboptions: CollapseAssignmentSectionsSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  addProgressDialogListener(() => {
    addCollapseButtons(suboptions.buttonPosition, unloaderContext);
  }, unloaderContext);
}

interface CollapseAssignmentSectionsSuboptions {
  buttonPosition: string;
}

export default registerModule('{83201f77-2bb8-4f92-a09d-1d113066214c}', {
  name: 'Collapse Assignment Sections',
  main: collapseAssignmentSectionsMain,
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
