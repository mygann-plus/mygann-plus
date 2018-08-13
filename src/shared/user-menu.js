import { createElement } from '~/utils/dom';

export const getHeader = () => document.querySelector('.oneline.parentitem.last .subnavtop');
export const getMobileSettingsLink = () => document.querySelector('#mobile-settings-link');
export const getDividers = () => (
  document.querySelectorAll('.oneline.parentitem.last > :nth-child(3) > :first-child > .divider')
);

export function appendDesktopUserMenuElem(elem) {
  const dividers = document.querySelectorAll(`
    .oneline.parentitem.last > :nth-child(3) > :first-child > .divider
  `);
  const nativeDivider = dividers[dividers.length - 1];
  nativeDivider.before(elem);
}

export function appendDesktopUserMenuLink(title, onClick) {
  const handleClick = e => {
    e.preventDefault();
    onClick();
  };
  const link = (
    <li>
      <a
        href="#"
        className="pri-75-bgc-hover black-fgc white-fgc-hover sky-nav"
        onClick={handleClick}
      >
        <span className="desc">
          <span className="title">{ title }</span>
        </span>
      </a>
    </li>
  );
  appendDesktopUserMenuElem(link);
  return link;
}
export function appendMobileUserMenuLink(title, onClick) {
  const handleClick = e => {
    e.preventDefault();
    document.body.click(); // hide mobile nav
    onClick();
  };
  const link = (
    <li>
      <a href="#" onClick={handleClick}>{ title }</a>
    </li>
  );
  const lastMobileLink = document.querySelector(`
    #mobile-account-nav + .app-mobile-level ul li:last-child
  `);
  lastMobileLink.before(link);
  return link;
}
