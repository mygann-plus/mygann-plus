import flatten from 'array-flatten';

import registerModule from '~/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { getAllMessageConversations } from '~/shared/messages';

import style from './style.css';

const ADMIN_ID = 4109775;

const selectors = {
  report: style.locals.report,
};

const domQuery = {
  siteMain: () => document.querySelector('#site-main'),
};

async function getBugReports() {
  const conversations = await getAllMessageConversations();
  const taskMessages = flatten(conversations
    .filter(conversation => (
      conversation.Messages.find(message => message.Body.includes('MyGann+ Bug Report'))
    ))
    .map(conversation => (
      conversation.Messages
        .filter(message => {
          return message.Body.includes('MyGann+ Bug Report') &&
            message.FromUser.UserId !== ADMIN_ID;
        })
        .map(message => {
          const lines = message.Body.split('<br>').join('\n');
          const body = lines.split('MyGann+ Bug Report:')[1].split('-- debug data')[0];
          const from = `${message.FromUser.FirstName} ${message.FromUser.LastName}`;
          let image = '';
          if (message.Body.includes('-- image id')) {
            const imageId = message.Body.match(/-- image id: (.+) --/)[1];
            image = `https://i.imgur.com/${imageId}.png`;
          }
          // const data = lines.slice(2, lines.length - 1);
          // return JSON.parse(data.join(''));
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
  constructor(reports) {
    this.reports = reports;
  }
  getPage() {
    return (
      <div>
        Bug Reports:
        { this.reports.map(report => (
          <div className={ selectors.report }>
            <b>From:</b> { report.from }
            <div>{ report.body} </div>
            {
              report.image ?
              <a href={report.image} target="_blank" rel="noopener noreferrer">
                <img src={report.image}></img>
              </a>
              : null
            }
          </div>
        )) }
      </div>
    );
  }
}

async function insertPage(siteMain) {
  const bugReports = await getBugReports();
  const panel = new AdminPanel(bugReports);
  siteMain.appendChild(panel.getPage());
  return panel.getPage();
}

async function admin(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const siteMain = await waitForLoad(domQuery.siteMain);
  const page = await insertPage(siteMain);
  const observer = new MutationObserver(async () => {
    if (document.body.contains(page)) {
      return;
    }
    await insertPage(siteMain);
    observer.disconnect();
  });
  observer.observe(siteMain, {
    childList: true,
  });
}

export default registerModule('{015b4a2e-c33a-44c6-8285-b4c5ca2b4ee6}', {
  name: 'internal.adminPanel',
  main: admin,
  showInOptions: false,
  affectsGlobal: true,
});

