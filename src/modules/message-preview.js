import { nodeListToArray, waitForLoad } from '../utils/dom';

const TRANSITION_TIME = 500; // milliseconds for fade in/out animations
const DISAPPEAR_TIME = 5000000; // milliseconds for fade out

function findUrls(text) {
  let source = (text || '').toString();
  let urlArray = [];
  let url;
  let matchArray;

  // Regular expression to find FTP, HTTP(S) and email URLs.
  let regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

  // Iterate through any URLs in the text.
  while ((matchArray = regexToken.exec(source)) !== null) {
    let token = matchArray[0];
    urlArray.push(token);
  }

  return urlArray;
}


function generateMessagePreview(message, frameDocument) {

  const wrap = document.getElementById('gocp_message-preview_wrap');

  const a = document.createElement('a');
  const div = document.createElement('div');
  const b = document.createElement('b');
  const body = document.createElement('span');
  const archive = document.createElement('a');

  archive.className = 'fa fa-archive';
  a.href = `https://gannacademy.myschoolapp.com/app/student#message/conversation/${message.id}`;

  div.style.background = '#52abf9';
  div.style.padding = '20px';
  div.style.paddingRight = '90px';
  div.style.borderRadius = '4px';
  div.style.boxShadow = '0px 3px 5px #c1bbbb';
  div.style.marginBottom = '10px';
  div.style.color = 'white';
  div.style.textDecoration = 'none';
  div.style.opacity = '0';
  div.style.transition = `opacity ${TRANSITION_TIME}ms`;
  archive.style.color = 'white';
  archive.style.right = '21px';
  archive.style.position = 'absolute';
  archive.style.fontSize = '20px';

  b.innerText = message.from;
  const bodyText = message.body.replace(/\n/g, ' ').replace(/\s\s/g, ' ');
  body.innerText = `: ${bodyText}`;

  function removeNode() {
    div.style.opacity = '0';
    setTimeout(() => {
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
      // generatePreviews(froms, frameDocument, true);
    }, TRANSITION_TIME);
  }
  function archiveMessage(e) {
    e.preventDefault();
    const isOnMessagesInbox = window.location.hash === '#message/inbox';
    const documentObject = isOnMessagesInbox ? document : frameDocument;
    // debugger; // eslint-disable-line
    documentObject
      .querySelector(`tr[data-messageid="${message.id}"]`)
      .querySelector('button[title="Archive"]')
      .click();
    removeNode();
    e.stopPropagation();
  }
  function fadeOut() {
    if (document.querySelectorAll('#gocp_message-preview_wrap:hover').length === 0) {
      removeNode();
    } else {
      document.querySelector('#gocp_message-preview_wrap').addEventListener('mouseleave', removeNode);
    }
  }

  div.addEventListener('click', removeNode);
  archive.addEventListener('click', archiveMessage);

  setTimeout(() => {
    div.style.opacity = '1';
  }, 10);
  setTimeout(fadeOut, DISAPPEAR_TIME);

  div.appendChild(b);
  div.appendChild(body);
  div.appendChild(archive);
  a.appendChild(div);
  wrap.appendChild(a);
}

function generatePreviews(froms, frameDocument, repeat) {
  if (document.getElementById('gocp_message-preview_wrap') && !repeat) return;

  const wrapElem = document.createElement('div');
  wrapElem.id = 'gocp_message-preview_wrap';
  wrapElem.style.position = 'fixed';
  wrapElem.style.right = '60px';
  wrapElem.style.bottom = '50px';
  wrapElem.style.zIndex = '1';

  document.body.appendChild(wrapElem);

  froms.forEach(m => generateMessagePreview(m, frameDocument));
}

function containsSurvey(text) {
  const urls = ['https://www.surveymonkey.com/r/FZXPNGR'];
  const contains = text.indexOf('https://www.surveymonkey.com') > -1;
  if (contains) {

  }
}

function getMessages(contentWindow) {
  const listElem = contentWindow.document.body.getElementsByClassName('table message-list m-0')[0];
  const list = nodeListToArray(listElem.children[0].children);
  return list
    .filter(e => e.className.indexOf('alert') > -1) // FILTER READ
    .map(elem => {
      const from = elem.children[1].children[1].children[0].innerText.split(',')[0];
      const bodyText = elem.children[1].children[2].innerText.trim();
      const body = bodyText.length > 50 - from.length ?
        `${bodyText.substring(0, 50 - from.length)}...`
        : bodyText;
      console.log(bodyText.indexOf('http'));
      const id = elem.getAttribute('data-messageid');

      return {
        from, body, id, elem,
      };

    });
}

function handleFrameLoad(contentWindow) {
  const DOM_QUERY = () => (
    contentWindow.document.body.getElementsByClassName('table message-list m-0')[0] &&
    contentWindow.document.body.getElementsByClassName('table message-list m-0')[0].children[0]
  );

  waitForLoad(DOM_QUERY, contentWindow.document)
    .then(() => {
      const messages = getMessages(contentWindow).slice(0, 3);
      generatePreviews(messages, contentWindow.document);
    });
}

function createFrame() {
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.src = 'https://gannacademy.myschoolapp.com/app/student#message/inbox';
  frame.id = 'gocp_message-preview_frame';
  frame.onload = () => handleFrameLoad(frame.contentWindow);
  if (!document.getElementById('gocp_message-preview_frame')) {
    document.body.appendChild(frame);
  }
}

export default function messagePreview() {
  createFrame();
}

// TODO: shift over to contentDocument
