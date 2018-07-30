import registerModule from '../utils/module';
import {
  waitForLoad,
  createElementFromHTML,
  insertCss,
  removeElements,
  addEventListeners,
  getElementsByIds,
  nodeListToArray,
} from '../utils/dom';
import { getUserProfile } from '../utils/user';
import storage, { generateID, changeItem, deleteItem } from '../utils/storage';
import { sanitizeHTMLString } from '../utils/string';

const identifiers = {
  saveButton: 'gocp_message-draft_save-button',
  sidebarLink: 'gocp_message-draft_sidebar-link',
  draftbox: 'gocp_message-draft_draftbox',
  idAttribute: 'data-gocp_message-draft_id',
  iconClasses: [
    'p3icon-radioOn',
    'p3icon-radioOff',
  ],
  tokenInput: 'token-input-recipient',
};

let insertedStyles;

function goBack(link) {
  insertedStyles.remove();
  removeElements(document.getElementsByClassName(identifiers.draftbox));
  const draftsLink = document.getElementById(identifiers.sidebarLink);

  for (const className of identifiers.iconClasses) {
    draftsLink.firstElementChild.classList.toggle(className);
    link.firstElementChild.classList.toggle(className);
  }

  link.removeEventListener('click', goBack);
}

async function enterToName(name) {
  const input = document.getElementById(identifiers.tokenInput);
  // set value
  input.value = name;
  input.dispatchEvent(new Event('keydown'));
  // trigger enter
  const enter = new KeyboardEvent('keydown', {
    keyCode: 13,
  });
  await waitForLoad(() => {
    return document.getElementsByClassName('token-input-selected-dropdown-item').length;
  });
  input.dispatchEvent(enter);
}

async function loadDraft(draft) {
  goBack(document.getElementById('view-active'));
  window.location.hash = '#message/compose';
  await waitForLoad(() => (
    document.getElementById('text') &&
    document.getElementById(identifiers.tokenInput)
  ));

  document.getElementById('text').value = draft.body;
  for (let name of draft.to) {
    await enterToName(name);
  }
  document.getElementById(identifiers.tokenInput).dispatchEvent(new KeyboardEvent('keydown'));
  document.getElementById('compose-message-display').setAttribute(identifiers.idAttribute, draft.id);
}

function deleteDraft(draft, draftbox) {
  if (window.confirm('Are you sure you want to delete this draft?')) { // eslint-disable-line no-alert, max-len
    deleteItem('message-drafts', draft.id);
    draftbox.remove();
  }
}

async function saveDraft() {
  const id = (
    document.getElementById('compose-message-display').getAttribute(identifiers.idAttribute) ||
    generateID()
  );
  const to = nodeListToArray(document.getElementsByClassName('token-input-token'))
    .map(e => e.children[0].innerText);
  const body = document.getElementById('text').value;
  const draft = { id, to, body };

  const drafts = await storage.get('message-drafts') || [];
  if (drafts.find(d => d.id === id)) {
    changeItem('message-drafts', id, () => draft);
  } else {
    drafts.push(draft);
    storage.set({ 'message-drafts': drafts });
  }
}

const formatBodyText = text => {
  return sanitizeHTMLString(text)
    .replace(/\n/g, '<br />')
    .trim();
};

function generateDraftbox(draft) {
  const imgSrc = `${getUserProfile()}?resize=100,100`;
  const html = `
    <tr class="conv-message ${identifiers.draftbox}">
      <td class="cell-thumb" style="width:65px;">
        <div class="bb-avatar-wrapper-medium pull-left">
          <img src="${imgSrc}" class="bb-avatar-image-medium">
        </div>
      </td>
      <td class="cell-message">
        <div class="pull-right pl-5">
          <span style="
            color: #cf1f4f;
            font-weight: bold;
            font-size: 16px;
          ">
            DRAFT
          </span>
          <br>
          <button 
            class="conv-tooltip conv-archive btn bb-btn-secondary btn-sm pull-right mt-5"
            rel="tooltip"
            title="Delete"
          >
            Delete
          </button>
        </div>
        <div class="bb-emphasized mt-0">
          <a href="#message/conversation/601211">${draft.to.join(', ')}</a>
        </div>
        <div class="message-list-body">${formatBodyText(draft.body)}</div>
      </td>
    </tr>
  `;

  const draftbox = createElementFromHTML(html, document.createElement('tbody'));
  draftbox.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    loadDraft(draft);
  });
  draftbox.children[1].children[0].children[2].addEventListener('click', e => {
    e.stopPropagation();
    deleteDraft(draft, draftbox);
  });

  return draftbox;
}

async function openDraftsPage(link) {
  const selected = document.getElementsByClassName('p3icon-radioOn')[0].parentNode;
  if (selected.id === identifiers.sidebarLink) return;

  for (const className of identifiers.iconClasses) {
    selected.firstElementChild.classList.toggle(className);
    link.firstElementChild.firstElementChild.classList.toggle(className);
  }

  const messageList = document.getElementsByClassName('table message-list m-0')[0];

  insertedStyles = insertCss(`
    .conv-message:not(.${identifiers.draftbox}) {
      display: none;
    }
  `);

  addEventListeners(getElementsByIds(['view-active', 'view-archived']), 'click', ({ target }) => {
    goBack(target);
  });

  const drafts = await storage.get('message-drafts') || [];
  drafts.map(generateDraftbox).forEach(elem => {
    messageList.children[0].appendChild(elem);
  });
}

// USER INTERFACE

function renderDraftButton() {
  const buttonHtml = `
    <a href="#" class="btn btn-default" id="${identifiers.saveButton}">
      Save Draft
    </a>
  `;
  const button = createElementFromHTML(buttonHtml);
  button.addEventListener('click', e => {
    e.preventDefault();
    saveDraft();
    goBack(document.getElementById('view-active'));
    document.getElementsByClassName('close')[0].click();
  });
  const sendButton = document.querySelector('a[data-loading-text="Sending..."]');
  sendButton.after(button);
}

function renderSidebarLink() {
  if (document.getElementById(identifiers.sidebarLink)) {
    return;
  }
  const linkHtml = `
    <li>
      <a id="${identifiers.sidebarLink}" href="#" class="right-side-filter p-5">
        <i class="p3icon-radioOff pull-right"></i>
        Drafts
      </a>
    </li>
  `;
  const link = createElementFromHTML(linkHtml);
  link.addEventListener('click', async e => {
    e.preventDefault();
    openDraftsPage(link);
  });
  const archiveLink = document.getElementById('view-archived').parentNode;
  archiveLink.archive(link);
}

const domQueries = {
  sidebar: () => document.getElementById('view-active'),
  compose: () => document.getElementById('compose-message-display'),
};

function messageDraft() {
  waitForLoad(domQueries.sidebar).then(renderSidebarLink);
  if (window.location.hash === '#message/compose') {
    waitForLoad(domQueries.compose).then(renderDraftButton);
  }
}

export default registerModule('Message Draft', messageDraft);
