import marked from 'marked';
import fetchReject from 'fetch-reject';

import registerModule from '~/core/module';
import { hasUpdated, addInstallStateChangeListener, clearInstallState } from '~/core/install';

import { createElement, insertCss, constructButton } from '~/utils/dom';
import Dialog from '~/utils/dialog';
import Flyout from '~/utils/flyout';
import manifest from '~/utils/manifest';

import { appendDesktopUserMenuLink, appendMobileUserMenuLink, getHeader } from '~/shared/user-menu';

import { shouldShowNotification, disableNotification } from './update-notification';
import { createBugReportUi, openBugReport } from './bug-report';
import selectors from './selectors';

import style from './style.css';

function getDescription() {
  return `${manifest.description}.`;
}

function getVersionString() {
  return manifest.version_name;
}

function isEqualVersion(tag: string, version: string) {
  return tag.substring(1) === version;
}

function toggleReleaseNotes(e: Event) {
  e.preventDefault();
  document.querySelector(`.${selectors.wrap}`).classList.toggle(selectors.releaseNotesShown);
}
async function insertReleaseNotes(dialogBody: HTMLElement) {
  const releaseNotesWrap = dialogBody.querySelector(`#${selectors.releaseNotes}`);
  const endpoint = 'https://api.github.com/repos/matankb/mygann-plus/releases';
  let releases;
  try {
    releases = await fetchReject(endpoint).then(d => d.json());
  } catch (e) {
    releases = [];
  }
  const currentVersion = getVersionString();
  const release = releases.find((r: any) => isEqualVersion(r.tag_name, currentVersion));
  if (!release) {
    releaseNotesWrap.innerHTML = 'There was an issue loading what\'s new. Please try again.';
  } else {
    releaseNotesWrap.innerHTML = marked(release.body); // parse markdown
  }
}


function showUpdateFlyout(aboutBody: HTMLElement) {
  const releaseNotesLink = aboutBody.querySelector(`#${selectors.releaseNotesLink}`) as HTMLElement;

  const flyout = new Flyout((
    <span>
      New version of MyGann+ Check out what&apos;s new!<br />
      <div id={ selectors.updateNotification.buttons }>
        {
          constructButton({
            textContent: 'Don\'t show again',
            onClick: () => { disableNotification(); flyout.hide(); },
          })
        }
      </div>
    </span>
  ));
  flyout.showAtElem(releaseNotesLink);
}

function handleBugReportClick(e: Event) {
  e.preventDefault();
  openBugReport();
}

/* eslint-disable max-len */

function createAboutBody() {
  return (
    <div className={selectors.wrap}>
      <h4 className={selectors.mainDescription}>{ getDescription() }</h4>
      <p>
        <b>Version: </b>
        { getVersionString() } (<a href="#" id={selectors.releaseNotesLink} onClick={(e: any) => toggleReleaseNotes(e)}>what&apos;s new</a>)
      </p>
      <div id={selectors.releaseNotes}>Loading...</div>
      <p><b>Created By:</b> Matan Kotler-Berkowitz</p>
      <p><b>Continued By:</b> Samuel Hirsh & Ilan Sperber</p>
      <hr className="divider" />

      <h2 className={selectors.sectionTitle}>Contact</h2>
      <ul>
        <li>
          Bug Reports: Please check the
          <a
            href="https://github.com/matankb/mygann-plus/wiki/Known-Issues"
            target="_blank"
            rel="noopener noreferrer"
          > known issues</a>,
          then <a href="#" onClick={(e: any) => handleBugReportClick(e)}>submit a bug report</a>.
          { createBugReportUi() }
        </li>
        <li>
          Suggestions, Requests, or Other Comments: Please email or talk to <a href="mailto:22shirsh@gannacademy.org">Samuel Hirsh</a> or <a href="mailto:22isperber@gannacademy.org">Ilan Sperber</a>.
        </li>
      </ul>

      <h2 className={selectors.sectionTitle}>Special Thanks</h2>
      <ul>
        <li>Noam Raz for helping to create the extension</li>
        <li>Shai Mann-Robison and Micah Shire-Plumb for beta testing and suggestions</li>
      </ul>
    </div>
  );
}

/* eslint-enable max-len */

async function showDialog() {
  const body = createAboutBody();
  const dialog = new Dialog('About MyGann+', body, {
    leftButtons: [Dialog.buttons.CLOSE],
  });
  insertReleaseNotes(body);
  dialog.open();
  if (await hasUpdated() && await shouldShowNotification()) {
    showUpdateFlyout(dialog.getBody());
    clearInstallState();
  }
}

async function aboutMain() {
  const desktopMenuLink = appendDesktopUserMenuLink('About MyGann+', showDialog);
  appendMobileUserMenuLink('About MyGann+', showDialog);
  insertCss(style.toString());

  if (await hasUpdated() && await shouldShowNotification()) {
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

    // const changeListener = window.addEventListener('storage', () => {
    //   if (localStorage.getItem('MyGannPlusUpdated') === 'false') {
    //     avatarBadge.remove();
    //     linkBadge.remove();
    //     // window.removeEventListener('storage', changeListener); // would have to be done by making callback a named function, not worth it
    //   }
    // });
  }
}

export default registerModule('{5ffd7ecc-654e-4b3e-a175-9cb468855c43}', {
  name: 'internal.about',
  init: aboutMain,
  showInOptions: false,
});
