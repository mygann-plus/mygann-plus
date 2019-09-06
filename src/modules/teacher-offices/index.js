import classNames from 'classnames';

import registerModule from '~/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { fetchData } from '~/utils/fetch';

import style from './style.css';

const TEACHER_OFFICES_PATH = '/teacher-offices/offices.json';
const TEACHER_OFFICES_SCHEMA_VERSION = 1;

const selectors = {
  roomLabel: style.locals['room-label'],
  helpIcon: style.locals['help-icon'],
};

function getOffice(teacherName, offices) {
  for (const office of offices) {
    if (office.faculty.includes(teacherName)) {
      return office;
    }
  }
}

async function insertFacultyOffices(wrap, offices) {
  await waitForLoad(() => wrap.querySelector('tbody > tr'));
  const listings = wrap.querySelectorAll('tbody > tr');

  for (const listing of listings) {
    const name = listing.querySelector('h3').textContent.trim();
    const office = getOffice(name, offices);
    const existingRoomLabel = listing.querySelector(`.${selectors.roomLabel}`);
    if (!office || existingRoomLabel) {
      continue;
    }

    const roomSpan = (
      <div className={selectors.roomLabel}>
        Office: { office.room }
        {
          office.help
            ? <i
                className={classNames('fa fa-question-circle', selectors.helpIcon)}
                title={office.help}
              />
            : null
        }
      </div>
    );
    listing.querySelector('h3').after(roomSpan);
  }
}

const domQuery = {
  results: () => document.querySelector('#directory-results'),
  container: () => document.querySelector('#directory-items-container'),
  heading: () => (
    document.querySelector('.bb-page-heading')
    && document.querySelector('.bb-page-heading').textContent.trim().includes('Faculty')
  ),
};

async function facultyOffices(opts, unloaderContext) {
  await waitForLoad(domQuery.heading);
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const results = await waitForLoad(domQuery.results);
  const container = await waitForLoad(domQuery.container);

  const offices = await fetchData(TEACHER_OFFICES_PATH, TEACHER_OFFICES_SCHEMA_VERSION);
  if (!offices) {
    return;
  }

  insertFacultyOffices(results, offices);

  const observer = new MutationObserver(() => insertFacultyOffices(results, offices));
  observer.observe(results, {
    childList: true,
  });
  observer.observe(container, {
    childList: true,
  });
  unloaderContext.addFunction(() => observer.disconnect());
}

export default registerModule('{17e77f22-7fc6-4fc9-875c-b7fad1e8febe}', {
  name: 'Teacher Offices',
  description: 'Show teacher and faculty office room numbers in the directory',
  main: facultyOffices,
  affectsGlobalState: true, // sets css that affects global
});
