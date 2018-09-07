import marked from 'marked';

import registerModule from '~/module';
import { hasUpdated, addInstallStateChangeListener, clearInstallState } from '~/install';

import { createElement, insertCss } from '~/utils/dom';
import Dialog from '~/utils/dialog';
import Flyout from '~/utils/flyout';
import getManifest from '~/utils/manifest';

import { appendDesktopUserMenuLink, appendMobileUserMenuLink, getHeader } from '~/shared/user-menu';

import style from './style.css';

const selectors = {
  wrap: style.locals.wrap,
  releaseNotesShown: style.locals['release-notes-shown'], // applies to wrap
  sectionTitle: style.locals['section-title'],
  mainDescription: style.locals['main-description'],
  updateBadge: style.locals['update-badge'],
  desktopAvatarBadge: style.locals['desktop-avatar-badge'],
  desktopLinkBadge: style.locals['desktop-link-badge'],
  releaseNotesLink: style.locals['release-notes-link'],
  releaseNotes: style.locals['release-notes'],
};


function getDescription() {
  return `${getManifest().description}.`;
}
function getVersionString() {
  return getManifest().version_name;
}

function toggleReleaseNotes(e) {
  e.preventDefault();
  document.querySelector(`.${selectors.wrap}`).classList.toggle(selectors.releaseNotesShown);
}
async function insertReleaseNotes(dialogBody) {
  const releaseNotesWrap = dialogBody.querySelector(`#${selectors.releaseNotes}`);
  const endpoint = 'https://api.github.com/repos/matankb/gann-oncampus-plus/releases';
  const [latestRelease] = await fetch(endpoint).then(d => d.json());
  releaseNotesWrap.innerHTML = marked(latestRelease.body); // parse markdown
}

function showUpdateFlyout(aboutBody) {
  const releaseNotesLink = aboutBody.querySelector(`#${selectors.releaseNotesLink}`);
  const flyout = new Flyout('New version of Gann OnCampus+ Check out what\'s new!', {
    onHide: clearInstallState,
  });
  flyout.showAtElem(releaseNotesLink);
}

/* eslint-disable max-len */

function createAboutBody() {
  return (
    <div className={selectors.wrap}>
      <h4 className={selectors.mainDescription}>{ getDescription() }</h4>
      <p>
        <b>Version: </b>
        { getVersionString() } (<a href="#" id={selectors.releaseNotesLink} onClick={toggleReleaseNotes}>release notes</a>)
      </p>
      <div id={selectors.releaseNotes}>Loading...</div>
      <p><b>Created By:</b> Matan Kotler-Berkowitz</p>
      <hr className="divider" />

      <h2 className={selectors.sectionTitle}>Contact</h2>
      <ul>
        <li>
          Bug Reports: Please check the
          <a
            href="https://github.com/matankb/gann-oncampus-plus/wiki/Known-Issues"
            target="_blank"
            rel="noopener noreferrer"
          > known issues</a>,
          then <a href="mailto:20mkotlerberkowitz@gannacademy.org?subject=Gann%20OnCampus+%20Bug%20Report">submit a bug report</a>.
        </li>
        <li>
          Suggestions, Requests, or Other Comments: Please email or talk to <a href="mailto:20mkotlerberkowitz@gannacademy.org">Matan Kotler-Berkowitz</a>.
        </li>
      </ul>

      <h2 className={selectors.sectionTitle}>Special Thanks</h2>
      <ul>
        <li>Noam Raz for helping to create the extension</li>
        <li>Shai Mann-Robsison and Micah Shire-Plumb for beta testing and suggestions</li>
      </ul>
    </div>
  );
}

/* eslint-enable max-len */

async function showDialog() {
  const body = createAboutBody();
  const dialog = new Dialog('About Gann OnCampus+', body, {
    leftButtons: [Dialog.buttons.OK],
  });
  insertReleaseNotes(body);
  dialog.open();
  if (await hasUpdated()) {
    showUpdateFlyout(dialog.getBody());
  }
}

async function about() {
  const desktopMenuLink = appendDesktopUserMenuLink('About OnCampus+', showDialog);
  appendMobileUserMenuLink('About OnCampus+', showDialog);
  insertCss(style.toString());

  if (await hasUpdated()) {
    const avatar = getHeader().parentNode.querySelector('.bb-avatar-wrapper-nav');
    const avatarBadge = (
      <span className={selectors.updateBadge} id={selectors.desktopAvatarBadge} />
    );
    avatar.after(avatarBadge);

    const linkBadge = <span className={selectors.updateBadge} id={selectors.desktopLinkBadge} />;
    desktopMenuLink.appendChild(linkBadge);

    const changeListener = addInstallStateChangeListener(({ newValue }) => {
      if (!newValue) {
        avatarBadge.remove();
        linkBadge.remove();
        changeListener.remove();
      }
    });
  }
}

export default registerModule('{5ffd7ecc-654e-4b3e-a175-9cb468855c43}', {
  name: 'internal.about',
  init: about,
  showInOptions: false,
});
