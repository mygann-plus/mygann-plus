import { createElement } from '~/utils/dom';

/* eslint-disable import/prefer-default-export */
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
