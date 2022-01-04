import { createElement } from '~/utils/dom';
import style from './style.css';

export const getHeader = () => document.querySelector('.oneline.parentitem.last .subnavtop');
export const getTopNavbar = () => document.querySelector('#site-user-nav > div > ul');
export const getNativeDropdown = () => document.querySelector('.oneline.parentitem .subnav') as HTMLElement;
export const getMobileAccountLink = () => document.querySelector('#site-mobile-usernav > ul > li:nth-child(3)'); // eslint-disable-line max-len

// add to menu
const selectors = {
  nav: style.locals.nav,
  pullleft: style.locals.pullleft,
  hidden: style.locals.hidden,
};

/* eslint-disable max-len */
const desktopMenu = (
  <li className="oneline parentitem last">
    <a href="#" data-taskid="-1" className="subnavtrigger white-fgc-hover sky-nav" id={selectors.nav}>
      <div className="bb-avatar-wrapper-nav pull-left">
        <img className="bb-avatar-image-nav" src="https://lh3.googleusercontent.com/8EPlmhx-PFvcBVhxNnlEv6u6SLz8uValHGkcHY07R7RCfqkU5f_oevZG-fOjFKCSn3Ncz3wowHMLOqZ8HT-iPG1S=w128-h128-e365-rj-sc0x00ffffff?resize=75,75" id="mygannplusicon" />
      </div>
      <span className="desc">
        <span className="title">MyGann+</span>
      </span>
      <span className="caret"></span>
    </a>
    <div className="subnavtop pri-75-bordercolor white-bgc gray-nav-boxshadow sky-nav"></div>
    <div className="subnav pri-75-bordercolor white-bgc gray-nav-boxshadow sky-nav">
      <ul></ul>
    </div>
  </li>
);

const mobileMenu = (
  <li className="clearfix">
    <i className="p3icon-thinArrowLeft p3formWhite pull-left" id={selectors.pullleft}></i>
    <a href="#" data-taskid="-1" id="mobile-account-nav">
      <span className="iHolder pull-left ddd">
        <img src="https://lh3.googleusercontent.com/8EPlmhx-PFvcBVhxNnlEv6u6SLz8uValHGkcHY07R7RCfqkU5f_oevZG-fOjFKCSn3Ncz3wowHMLOqZ8HT-iPG1S=w128-h128-e365-rj-sc0x00ffffff" />
      </span>
      <span className="title">MyGann+</span>
    </a>
    <div className="app-mobile-level">
      <h2>MyGann+</h2>
      <div className="app-mobile-back">
        <i className="p3icon-sideArrow pull-right"></i>
        Back
      </div>
      <ul>
        <div className={selectors.hidden}></div>
      </ul>
    </div>
  </li>
);
/* eslint-enable max-len */

export { desktopMenu, mobileMenu };

const desktopUl = desktopMenu.lastElementChild.firstElementChild;

function fixClasses() {
  for (let el of desktopUl.children) el.classList.remove('first', 'last');
  if (desktopUl.lastElementChild.classList.contains('divider')) desktopUl.lastElementChild.remove(); // remove the divider if there is nothing after it (the about and options will always be before)
  desktopUl.firstElementChild.classList.add('first');
  desktopUl.lastElementChild.classList.add('last');
}

function appendDesktopUserMenuElem(elem: Element, afterDiv: boolean) {
  let div = desktopUl.querySelector('.divider');
  if (afterDiv) {
    if (!div) div = desktopUl.appendChild(<li className="divider"></li>); // make the divider if it doesn't exist
    desktopUl.appendChild(elem);
  } else if (div) {
    div.before(elem); // afterDiv is off so it should go before the divider
  } else {
    desktopUl.appendChild(elem); // there is no divider and no need to create one
  }
  fixClasses();
  return elem;
}

function appendDesktopUserMenuButton(title: string, onClick: () => void, afterDiv: boolean) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    onClick();
  };
  const link = (
    <li>
      <a
        href="#"
        className="pri-75-bgc-hover black-fgc white-fgc-hover sky-nav"
        onClick={(e: any) => handleClick(e)}
      >
        <span className="desc">
          <span className="title">{ title }</span>
        </span>
      </a>
    </li>
  );
  return appendDesktopUserMenuElem(link, afterDiv);
}

function appendMobileUserMenuButton(title: string, onClick: () => void, afterDiv: boolean) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    document.body.click(); // hide mobile nav
    onClick();
  };
  const link = (
    <li>
      <a
        href="#"
        onClick={(e: any) => handleClick(e)}
      >
        { title }
      </a>
    </li>
  );
  const ul = mobileMenu.lastElementChild.lastElementChild;
  if (afterDiv) ul.appendChild(link);
  else ul.querySelector(`.${selectors.hidden}`).before(link);
  return link;
}

export function appendUserMenuButton(title: string, onClick: () => void, afterDiv = false) {
  return {
    desktop: appendDesktopUserMenuButton(title, onClick, afterDiv),
    mobile: appendMobileUserMenuButton(title, onClick, afterDiv),
    remove() {
      this.desktop.remove();
      this.mobile.remove();
      fixClasses();
    },
  };
}

function appendDesktopUserMenuLink(title: string, href: string, afterDiv: boolean) {
  const link = (
    <li>
      <a href={ href } className="pri-75-bgc-hover black-fgc white-fgc-hover sky-nav">
        <span className="desc">
          <span className="title">{ title }</span>
        </span>
      </a>
    </li>
  );
  return appendDesktopUserMenuElem(link, afterDiv);
}

function appendMobileUserMenuLink(title: string, href: string, afterDiv: boolean) {
  const link = (
    <li>
      <a href={ href }>{ title }</a>
    </li>
  );
  const ul = mobileMenu.lastElementChild.lastElementChild;
  if (afterDiv) ul.appendChild(link);
  else ul.querySelector(`.${selectors.hidden}`).before(link);
  return link;
}

export function appendUserMenuLink(title: string, href: string, afterDiv = false) {
  return {
    destop: appendDesktopUserMenuLink(title, href, afterDiv),
    mobile: appendMobileUserMenuLink(title, href, afterDiv),
    remove() {
      this.desktop.remove();
      this.mobile.remove();
      fixClasses();
    },
  };
}
