import classNames from 'classnames';

import { Module } from '~/core/module';
import { getLoadedModules } from '~/core/module-loader';

import { createElement } from '~/utils/dom';
import { fetchJson, fetchApi } from '~/utils/fetch';
import manifest from '~/utils/manifest';

import selectors from './selectors';

function stringifyModulesData(modules: Map<string, Module>) {
  const obj: any = {};
  for (const key of modules.keys()) {
    const val = modules.get(key);
    obj[JSON.stringify(key)] = val;
  }
  return JSON.stringify(obj);
}

async function uploadImage(fileInput: HTMLInputElement) {
  const body = new FormData();
  body.append('image', fileInput.files[0]);
  const response = await fetchJson('https://api.imgur.com/3/image.json', {
    method: 'POST',
    headers: new Headers({
      Authorization: 'Client-Id 0fb53e78ea178b9',
    }),
    body,
  });
  return response.data.id;
}

async function getUserByName(name: string) {
  const users = await fetchApi('/api/message/getrecipients?format=json');
  return users.find((user: any) => user.name === name);
}

async function uploadDebugData() {
  const debugData = {
    loadedModules: stringifyModulesData(getLoadedModules()),
    version: manifest.version_name,
  };
  const response = await fetchJson('https://api.myjson.com/bins', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json; charset=utf-8',
    }),
    body: JSON.stringify(debugData),
  });
  return response.uri.split('/')[4]; // upload id
}

async function sendReport() {
  const RECIPENT_NAME = 'Matan Kotler-Berkowitz \'20';

  const bugReportWrap = document.querySelector(`.${selectors.bugReport.wrap}`);
  const fileInput = bugReportWrap.querySelector(`.${selectors.bugReport.fileInput}`) as HTMLInputElement;
  const description = bugReportWrap.querySelector('textarea').value;
  const endpoint = '/api/message/conversation/?format=json';
  const recipent = await getUserByName(RECIPENT_NAME);
  const debugDataId = await uploadDebugData();
  let imageId;

  let messageText = `
  MyGann+ Bug Report:
  ${description}
  
  -- debug data id: ${debugDataId} --
  `.trim();

  if (fileInput.value) {
    imageId = await uploadImage(fileInput);
    messageText += `\n-- image id: ${imageId} --`;
  }

  await fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      Messages: [{
        Body: messageText,
        Status: 2,
        FromSelf: false,
      }],
      ParticipantList: RECIPENT_NAME,
      Participants: [{
        AssociationId: String(recipent.associationId),
        Pk: String(recipent.userId),
        MembersToInclude: '0',
        name: RECIPENT_NAME,
      }],
    }),
  });
}

function updateFileInput(e: Event) {
  const button = e.target as HTMLInputElement;
  const fileName = button.files[0].name;
  const fileNameElem = button.parentNode.querySelector(`.${selectors.bugReport.fileName}`);
  fileNameElem.textContent = fileName;
}

export function openBugReport() {
  document.querySelector(`.${selectors.bugReport.wrap}`).classList.remove(selectors.bugReport.hidden);
}
function closeBugReport() {
  const wrap = document.querySelector(`.${selectors.bugReport.wrap}`);
  wrap.classList.add(selectors.bugReport.hidden);
  const sendButton = wrap.querySelector(`.${selectors.bugReport.sendButton}`);
  sendButton.textContent = 'Send Report';
  sendButton.classList.remove('disabled');
  wrap.querySelector('textarea').value = '';
  (wrap.querySelector(`.${selectors.bugReport.fileInput}`) as HTMLInputElement).value = '';
  wrap.querySelector(`.${selectors.bugReport.fileName}`).textContent = '';
}

async function handleSendClick(e: any) {
  const button = e.target as HTMLElement;
  button.textContent = 'Sending...';
  button.classList.add('disabled');
  await sendReport();
  closeBugReport();
  button.classList.remove('disabled');
}

export function createBugReportUi() {
  const fileInput = (
    <label className={classNames('btn btn-sm', selectors.bugReport.fileLabel)}>
      <i className="fa fa-paperclip" />
      <span className={selectors.bugReport.fileName}></span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className={selectors.bugReport.fileInput}
        onChange={(e: any) => updateFileInput(e)}
      >
      </input>
    </label>
  );
  return (
    <div className={classNames(selectors.bugReport.wrap, selectors.bugReport.hidden)}>
      <textarea
        className={selectors.bugReport.textarea}
        placeholder="Describe what happened"
      >
      </textarea>
      <div>
        { fileInput }
        <button
          className={classNames('btn btn-sm btn-primary', selectors.bugReport.sendButton)}
          onClick={handleSendClick}
        >
          Send Report
        </button>
      </div>
  </div>
  );
}
