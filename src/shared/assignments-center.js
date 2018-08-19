import { createElement } from '~/utils/dom';

/* eslint-disable import/prefer-default-export */
export function appendMobileAssignmentCenterMenuLink(textContent, onClick, sectionIndex) {
  const link = (
    <li>
      <a className="sec-75-bgc-hover" href="#" onClick={onClick}>
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
