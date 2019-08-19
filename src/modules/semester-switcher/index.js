import classNames from 'classnames';

import registerModule from '~/module';
import { waitForLoad, constructButton, insertCss } from '~/utils/dom';

import style from './style.css';
import { observeCoursesBar } from '~/shared/progress';

const selectors = {
  switchIcon: style.locals['switch-icon'],
};

const domQuery = {
  semesterButton: value => document.querySelector(`[data-action="term"][data-value="${value}"]`),
  secondSemester: () => document.querySelector('[data-action="term"]:last-child'),
  activeSemester: () => document.querySelector('[data-action="term"].active'),
  inactiveSemester: () => document.querySelector('[data-action="term"]:not(.active)'),
};

async function switchSemesters() {
  const active = domQuery.activeSemester();
  const inactive = domQuery.inactiveSemester();
  active.click();

  // courses bar is rerendered when active is clicked,
  // so "new" inactive is found by old inactive's data-value
  const newInactive = await waitForLoad(() => domQuery.semesterButton(inactive.dataset.value));
  newInactive.click();
}

async function insertSwitchButton() {
  const secondSemesterBtn = await waitForLoad(domQuery.secondSemester);

  const switchButton = constructButton(
    '', '',
    classNames('fa fa-exchange', selectors.switchIcon),
    switchSemesters,
  );
  switchButton.title = 'Switch Semester';

  secondSemesterBtn.after(switchButton);
  return switchButton;
}

async function semesterSwitcher(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  let switchButtonUnloader = unloaderContext.addRemovable(await insertSwitchButton());

  const coursesBarObserver = await observeCoursesBar(async () => {
    switchButtonUnloader.remove();
    switchButtonUnloader = unloaderContext.addRemovable(await insertSwitchButton());
  });

  unloaderContext.addRemovable(coursesBarObserver);
}

export default registerModule('{9d28ed37-4d06-4ce5-bc25-f10776491e96}', {
  name: 'Semester Switcher',
  description: 'Button to quickly switch semesters.',
  main: semesterSwitcher,
});
