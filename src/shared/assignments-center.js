import { createElement, waitForLoad } from '~/utils/dom';

export function appendMobileAssignmentCenterMenuLink(textContent, onClick, sectionIndex) {
  const handleClick = e => {
    e.preventDefault();
    onClick(e);
  };
  const link = (
    <li>
      <a className="sec-75-bgc-hover" href="#" onClick={handleClick}>
        { textContent }
      </a>
    </li>
  );
  const divider = document.querySelectorAll('#optionsMenu .divider')[sectionIndex];
  if (!divider) { // last section
    document.querySelector('#optionsMenu').appendChild(link);
  } else {
    divider.before(link);
  }
  return link;
}

export async function addAssignmentTableMutationObserver(fn) {
  const table = await waitForLoad(() => {
    return document.querySelector('#assignment-center-assignment-items');
  });
  const observer = new MutationObserver(fn);
  observer.observe(table, {
    childList: true,
  });
  return {
    remove() { observer.disconnect(); },
  };
}

export function isTask(assignmentRow) {
  return assignmentRow.querySelector('[data-heading="Type"]').textContent === 'My tasks';
}
