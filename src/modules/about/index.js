import registerModule from '~/module';

import { createElement, insertCss } from '~/utils/dom';
import Dialog from '~/utils/dialog';
import { appendDesktopUserMenuLink, appendMobileUserMenuLink, getHeader } from '~/shared/user-menu';
import { hasUpdated, addInstallStateChangeListener, clearInstallState } from '~/install';
import Flyout from '~/utils/flyout';

import style from './style.css';

const selectors = {
  wrap: style.locals.wrap,
  sectionTitle: style.locals['section-title'],
  mainDescription: style.locals['main-description'],
  updateBadge: style.locals['update-badge'],
  desktopAvatarBadge: style.locals['desktop-avatar-badge'],
  desktopLinkBadge: style.locals['desktop-link-badge'],
  releaseNotesLink: 'gocp_about_release-notes-link',
};

function getDescription() {
  return `${chrome.runtime.getManifest().description}.`;
}
function getVersionString() {
  return chrome.runtime.getManifest().version_name;
}
function getReleaseNotesUrl() {
  return `https://github.com/matankb/gann-oncampus-plus/releases/tag/v${getVersionString()}`;
}

function showUpdateFlyout(aboutBody) {
  const releaseNotesLink = aboutBody.querySelector(`#${selectors.releaseNotesLink}`);
  const flyout = new Flyout('New version of Gann OnCampus+ Check out what\'s new!', {
    onHide: clearInstallState,
  });
  flyout.showAtElem(releaseNotesLink);
}

function createAboutBody() {
  return (
    <div className={selectors.wrap}>
      <h4 className={selectors.mainDescription}>{ getDescription() }</h4>
      <p>
        <b>Version: </b>
        { getVersionString() } (<a href={getReleaseNotesUrl()} target="_blank" rel="noopener noreferrer" id={selectors.releaseNotesLink}>release notes</a>)
      </p>
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

async function showDialog() {
  const dialog = new Dialog('About Gann OnCampus+', createAboutBody(), {
    leftButtons: [Dialog.buttons.OK],
  });
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
    const avatarBadge = <span className={selectors.updateBadge} id={selectors.desktopAvatarBadge} />;
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
