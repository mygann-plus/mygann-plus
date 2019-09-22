import classNames from 'classnames';

import registerModule from '~/module';
import { waitForLoad, constructButton, insertCss } from '~/utils/dom';

import style from './style.css';
import { observeCoursesBar, observeActivitiesBar } from '~/shared/progress';

const selectors = {
  switchIcon: style.locals['switch-icon'],
};

const domQuery = {
  coursesBar: () => document.querySelector('#coursesCollapse'),
  activitiesBar: () => document.querySelector('#activitiesCollapse'),

  termButton: (parent, value) => parent.querySelector(`[data-action="term"][data-value="${value}"]`),
  firstTerm: parent => parent.querySelector('[data-action="term"]:first-child'),
  lastTerm: parent => parent.querySelector('[data-action="term"]:last-child'),
  activeTerm: parent => parent.querySelector('[data-action="term"].active'),
  inactiveTerm: parent => parent.querySelector('[data-action="term"]:not(.active)'),
};

async function switchSemesters(parent, getParent) {
  const active = domQuery.activeTerm(parent);
  const inactive = domQuery.inactiveTerm(parent);

  // neither term or both terms are selected
  if (!active || !inactive) {
    const firstTerm = domQuery.firstTerm(parent);
    return firstTerm.click();
  }

  active.click();

  // courses bar is rerendered when active is clicked,
  // so "new" inactive is found by old inactive's data-value
  const newInactive = await waitForLoad(() => {
    return domQuery.termButton(getParent(), inactive.dataset.value);
  });
  newInactive.click();
}

function generateSwitchButton(sectionName, cb) {
  const switchButton = constructButton(
    '', '',
    classNames('fa fa-exchange', selectors.switchIcon),
    cb,
  );
  switchButton.title = `Switch ${sectionName}`;
  return switchButton;
}

async function insertSwitchButton(getParent, sectionName) {
  const parent = getParent();
  const secondSemesterBtn = await waitForLoad(() => domQuery.lastTerm(parent));

  const switchButton = generateSwitchButton(sectionName, () => switchSemesters(parent, getParent));

  secondSemesterBtn.after(switchButton);
  return switchButton;
}

function insertSemesterSwitchButton() {
  return insertSwitchButton(domQuery.coursesBar, 'Semester');
}

function insertSeasonSwitchButton() {
  return insertSwitchButton(domQuery.activitiesBar, 'Season');
}

async function semesterSwitcher(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForLoad(() => domQuery.coursesBar() && domQuery.activitiesBar());

  let semesterSwitchButtonUnloader = unloaderContext.addRemovable(() => (
    insertSemesterSwitchButton()
  ));
  let seasonSwitchButtonUnloader = unloaderContext.addRemovable(() => (
    insertSeasonSwitchButton()
  ));

  const coursesBarObserver = await observeCoursesBar(async () => {
    semesterSwitchButtonUnloader.remove();
    semesterSwitchButtonUnloader = unloaderContext.addRemovable(await insertSemesterSwitchButton());
  });

  const activitiesBarObserver = await observeActivitiesBar(async () => {
    seasonSwitchButtonUnloader.remove();
    seasonSwitchButtonUnloader = unloaderContext.addRemovable(await insertSeasonSwitchButton());
  });

  unloaderContext.addRemovable(coursesBarObserver);
  unloaderContext.addRemovable(activitiesBarObserver);
}

export default registerModule('{9d28ed37-4d06-4ce5-bc25-f10776491e96}', {
  name: 'Semester Switcher',
  description: 'Button to quickly switch semesters.',
  main: semesterSwitcher,
});
