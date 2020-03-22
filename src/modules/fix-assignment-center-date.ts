// Fixes native MyGann quirk where dates < 10 are padded with 0
// e.g. Friday, January 03, 2020

import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';
import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';

const domQuery = {
  headers: [
    () => document.querySelector('#small-date-display-label'),
    () => document.querySelector('#date-display-label'),
    () => document.querySelector('#mobile-date-display-label'),
  ],
};

function fixHeader(header: Element) {
  const date = header.textContent;
  const fixedDate = date.replace(/0([1-9]),/, (_: string, digit: string) => {
    return `${digit},`;
  });
  header.textContent = fixedDate;
}

async function fixHeaders() {
  for (const headerQuery of domQuery.headers) {
    waitForLoad(headerQuery).then(header => {
      fixHeader(header);
    });
  }
}

async function fixAssignmentCenterDate() {
  fixHeaders();
  addAssignmentTableMutationObserver(fixHeaders);
}

export default registerModule('{a11ce73b-03d5-4cee-9cd6-2dbd63d38340}', {
  name: 'fix.assignmentCenterDate',
  main: fixAssignmentCenterDate,
  showInOptions: false,
});
