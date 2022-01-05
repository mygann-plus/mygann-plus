import marked from 'marked';
import fetchReject from 'fetch-reject';

import registerModule from '~/core/module';
import { hasUpdated, addInstallStateChangeListener, clearInstallState } from '~/core/install';

import { createElement, insertCss, constructButton } from '~/utils/dom';
import Dialog from '~/utils/dialog';
import Flyout from '~/utils/flyout';
import manifest from '~/utils/manifest';

import { appendUserMenuButton, getHeader } from '~/shared/user-menu';

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
  let allReleases;
  try {
    allReleases = await fetchReject(endpoint).then(d => d.json());
  } catch (e) {
    allReleases = [];
  }
  const currentVersion = getVersionString();
  const [major, minor, curPatch] = currentVersion.split('.');
  const releases = [];
  for (let patch = Number(curPatch); patch >= 0; patch--) {
    const release = allReleases.find((r: any) => isEqualVersion(r.tag_name, `${major}.${minor}.${patch}`));
    if (release) releases.push(release);
  }
  if (!releases.length) {
    releaseNotesWrap.innerHTML = 'There was an issue loading what\'s new. Please try again.';
  } else {
    releaseNotesWrap.innerHTML = marked(releases.map(r => r.body).join('\n\n')); // parse markdown
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
            textContent: 'Hide',
            onClick: () => { flyout.hide(); },
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
  if (await hasUpdated()) {
    showUpdateFlyout(dialog.getBody());
    clearInstallState();
  }
}

async function aboutMain() {
  const desktopMenuLink = appendUserMenuButton('About MyGann+', showDialog).desktop;
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
  init: aboutMain,
  showInOptions: false,
});
