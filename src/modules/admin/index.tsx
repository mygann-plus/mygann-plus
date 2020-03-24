import flatten from 'array-flatten';

import registerModule from '~/core/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { getAllMessageConversations } from '~/shared/messages';

import style from './style.css';
import { getUserId } from '~/utils/user';

const ADMIN_ID = 4109775;

const selectors = {
  spinner: style.locals.spinner,
  report: style.locals.report,
};

const domQuery = {
  siteMain: () => document.querySelector('#site-main'),
};

interface BugReport {
  from: string;
  body: string;
  image: string;
}

async function getBugReports(): Promise<BugReport[]> {
  const conversations = await getAllMessageConversations();
  const taskMessages = flatten(conversations
    .filter((conversation: any) => (
      conversation.Messages.find((message: any) => message.Body.includes('MyGann+ Bug Report'))
    ))
    .map((conversation: any) => (
      conversation.Messages
        .filter((message: any) => {
          return message.Body.includes('MyGann+ Bug Report')
            && message.FromUser.UserId !== ADMIN_ID;
        })
        .map((message: any) => {
          const lines = message.Body.split('<br>').join('\n');
          const body = lines.split('MyGann+ Bug Report:')[1].split('-- debug data')[0];
          const from = `${message.FromUser.FirstName} ${message.FromUser.LastName}`;
          let image = '';
          if (message.Body.includes('-- image id')) {
            const imageId = message.Body.match(/-- image id: (.+) --/)[1];
            image = `https://i.imgur.com/${imageId}.png`;
          }
          return {
            from,
            body,
            image,
          };
        })
    )));
  return taskMessages;
}

class AdminPanel {

  private page: HTMLElement;

  constructor() {
    this.page = this.generatePage();
    getBugReports().then(reports => {
      this.populateReports(reports);
      this.removeSpinner();
    });
  }

  populateReports(reports: BugReport[]) {
    const reportsWrap = this.page.querySelector(`.${selectors.report}`);
    reports.forEach(report => {
      const reportElem = (
        <div className={selectors.report}>
          <b>From:</b> {report.from}
          <div>{report.body} </div>
          {
            report.image
              ? <a href={report.image} target="_blank" rel="noopener noreferrer">
                <img src={report.image}></img>
              </a>
              : null
          }
        </div>
      );
      reportsWrap.appendChild(reportElem);
    });
  }

  removeSpinner() {
    this.page.querySelector('.fa-spin').remove();
  }

  /* eslint-disable class-methods-use-this */

  generatePage() {
    return (
      <div>
        Bug Reports:
        <div className={selectors.spinner}>
          <i className="fa fa-spinner fa-spin" />
        </div>
        <div className={selectors.report}>
        </div>
      </div>
    );
  }

  getPage() {
    return this.page;
  }
}

async function adminMain() {
  if (await getUserId() !== String(ADMIN_ID)) {
    return;
  }

  insertCss(style.toString());

  const siteMain = await waitForLoad(domQuery.siteMain);
  const panel = new AdminPanel();
  siteMain.appendChild(panel.getPage());
  const observer = new MutationObserver(async () => {
    if (document.body.contains(panel.getPage())) {
      return;
    }
    siteMain.appendChild(panel.getPage());
    observer.disconnect();
  });
  observer.observe(siteMain, {
    childList: true,
  });
}

export default registerModule('{015b4a2e-c33a-44c6-8285-b4c5ca2b4ee6}', {
  name: 'internal.adminPanel',
  main: adminMain,
  showInOptions: false,
  affectsGlobal: true,
});
