import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, constructButton, insertCss } from '~/utils/dom';
import { observeCoursesBar, observeActivitiesBar } from '~/shared/progress';

import style from './style.css';

const selectors = {
  switchIcon: style.locals['switch-icon'],
};

const domQuery = {
  coursesBar: () => document.querySelector('#coursesCollapse') as HTMLElement,
  activitiesBar: () => document.querySelector('#activitiesCollapse') as HTMLElement,

  termButton: (parent: HTMLElement, value: string) => (
    parent.querySelector(`[data-action="term"][data-value="${value}"]`) as HTMLElement
  ),
  firstTerm: (parent: HTMLElement) => (
    parent.querySelector('[data-action="term"]:first-child') as HTMLElement
  ),
  lastTerm: (parent: HTMLElement) => parent.querySelector('[data-action="term"]:last-child'),
  activeTerm: (parent: HTMLElement) => (
    parent.querySelector('[data-action="term"].active') as HTMLElement
  ),
  inactiveTerm: (parent: HTMLElement) => (
    parent.querySelector('[data-action="term"]:not(.active)') as HTMLElement
  ),
};

async function switchSemesters(parent: HTMLElement, getParent: () => HTMLElement) {
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

function generateSwitchButton(sectionName: string, cb: (e: Event) => void) {
  const switchButton = constructButton({
    iClassName: classNames('fa fa-exchange', selectors.switchIcon),
    onClick: cb,
  });
  switchButton.title = `Switch ${sectionName}`;
  return switchButton;
}

async function insertSwitchButton(getParent: () => HTMLElement, sectionName: string) {
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

async function semesterSwitcherMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForLoad(() => domQuery.coursesBar() && domQuery.activitiesBar());

  let semesterSwitchButtonUnloader = unloaderContext.addRemovable(
    await insertSemesterSwitchButton(),
  );
  let seasonSwitchButtonUnloader = unloaderContext.addRemovable((
    await insertSeasonSwitchButton()
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
  name: 'Semester & Season Switcher',
  description: 'Button to quickly switch semesters and sports seasons.',
  main: semesterSwitcherMain,
});
