import registerModule from '~/module';

import { waitForLoad, waitForOne, constructButton, insertCss, addEventListener } from '~/utils/dom';
import tick from '~/utils/tick';
import { getAbsoluteToday } from '~/utils/date';

import {
  addAssignmentTableMutationObserver,
  appendMobileAssignmentCenterMenuLink,
} from '~/shared/assignments-center';

import style from './style.css';
import { getIsFiltered, setIsFiltered } from './due-soon-model';

let isFiltered = false;

const selectors = {
  mainButton: style.locals['main-button'],
  buttonActive: style.locals['button-active'], // used for both desktop and mobile
  hiddenAssignment: style.locals['hidden-assignment'],
};

const domQuery = {
  rangeButton: () => document.querySelector('#custom-view'),
  assignments: () => document.querySelectorAll('#assignment-center-assignment-items > *'),
  header: {
    main: () => document.querySelector('#small-date-display-label'),
    small: () => document.querySelector('#date-display-label'),
    mobile: () => document.querySelector('#mobile-date-display-label'),
  },
};

const dateRanges = {
  todayAndTommorow: 'todayAndTommorow',
  tommorow: 'tommorow',
};

async function setHeadersText(text) {
  const header = await waitForLoad(domQuery.header.main);
  const smallHeader = await waitForLoad(domQuery.header.small);
  const mobileHeader = await waitForLoad(domQuery.header.mobile);
  header.textContent = text;
  smallHeader.textContent = text;
  mobileHeader.textContent = text;
}

async function normalizeSelectedRange() {
  document.querySelector('#button-today').click();
  document.querySelectorAll('.assignmentDisplayTypeFilter')[1].click();
  await tick();
}

// disabled or enables day-range and assigned-due buttons
async function setDateButtonsDisabled(isDisabled) {
  const buttons = await waitForOne(() => ([
    ...[
      'custom-view', 'month-view', 'week-view', 'day-view',
      'next-button', 'previous-button', 'button-today',
    ].map(id => document.querySelector(`#${id}`)),
    ...document.querySelectorAll('label.assignmentDisplayTypeFilter'),
  ]));
  for (const button of buttons) {
    if (isDisabled) {
      button.setAttribute('disabled', '');
    } else {
      button.removeAttribute('disabled');
    }
  }
}

async function disableDueSoonFilter() {
  const hiddenAssignments = document.querySelectorAll(`.${selectors.hiddenAssignment}`);
  for (const assignment of hiddenAssignments) {
    assignment.classList.remove(selectors.hiddenAssignment);
  }
  setDateButtonsDisabled(false);
}

async function enableDueSoonFilter(dateRange) {
  const assignments = await waitForOne(domQuery.assignments);
  for (const assignment of assignments) {
    const due = assignment.querySelector('[data-heading="Due"]').textContent;
    const dueDate = new Date(due);
    const rangeStart = getAbsoluteToday();
    const rangeEnd = getAbsoluteToday();
    rangeEnd.setTime(rangeEnd.getTime() + (1000 * 60 * 60 * 24));
    if (dateRange === dateRanges.tommorow) {
      rangeStart.setTime(rangeEnd.getTime() - 1);
    }
    if (dueDate.getTime() <= rangeEnd.getTime() && dueDate.getTime() >= rangeStart.getTime()) {
      continue;
    }
    assignment.classList.add(selectors.hiddenAssignment);
  }
  setDateButtonsDisabled(true);
  const headerText = dateRange === dateRanges.todayAndTommorow ? 'Today & Tommorow' : 'Tommorow';
  setHeadersText(`Due ${headerText}`);
}

function runFilter(suboptions) {
  if (isFiltered) {
    enableDueSoonFilter(suboptions.dateRange);
  } else {
    disableDueSoonFilter();
  }
}

async function toggleFiltered(suboptions) {
  isFiltered = !isFiltered;
  setIsFiltered(isFiltered);
  await normalizeSelectedRange();
  runFilter(suboptions);
}

function handleButtonClick(e, suboptions, desktopButton, mobileButton) {
  e.target.blur();
  desktopButton.classList.toggle('active');
  mobileButton.classList.toggle(selectors.buttonActive);
  toggleFiltered(suboptions);
}

async function dueSoon(suboptions) {
  insertCss(style.toString());

  isFiltered = await getIsFiltered();
  runFilter(suboptions);

  const rangeButton = await waitForLoad(domQuery.rangeButton);
  const desktopButton = constructButton(
    'Due Soon', '', '',
    () => {}, selectors.mainButton,
  );
  rangeButton.after(desktopButton);

  const mobileButton = appendMobileAssignmentCenterMenuLink('Due Soon', () => {}, 0);

  if (isFiltered) {
    desktopButton.classList.add('active');
    mobileButton.classList.add(selectors.buttonActive);
  }

  addEventListener(desktopButton, 'click', e => {
    handleButtonClick(e, suboptions, desktopButton, mobileButton);
  });
  addEventListener(mobileButton, 'click', e => {
    handleButtonClick(e, suboptions, desktopButton, mobileButton);
  });

  addAssignmentTableMutationObserver(() => runFilter(suboptions));
}

export default registerModule('{5351d862-0067-49b5-b4b4-3aa6957db245}', {
  name: 'Due Soon',
  description: 'Button to quickly see assignments due today or tommorow.',
  main: dueSoon,
  suboptions: {
    dateRange: {
      name: 'Date Range',
      type: 'enum',
      defaultValue: dateRanges.todayAndTommorow,
      enumValues: {
        [dateRanges.todayAndTommorow]: 'Today and Tommorow',
        [dateRanges.tommorow]: 'Tommorow',
      },
    },
  },
});

