import { createElement, waitForLoad, constructButton } from '~/utils/dom';

import style from './style.css';

const selectors = {
  frame: style.locals.frame,
  button: style.locals.button,
  close: style.locals.close,
  title: style.locals.title,
};

function generateFrame(existingUrl: string) {
  const urls = [
    'https://www.youtube.com/embed/myjEoDypUD8',
    'https://www.youtube.com/embed/Z8lNz2AqoRw',
    'https://www.youtube.com/embed/FO0iG_P0P6M',
    'https://www.youtube.com/embed/FaOSCASqLsE',
    'https://www.youtube.com/embed/3ct68JZKsZ8',
    'https://www.boredbutton.com',
    'https://theuselessweb.com/',
    'https://funhtml5games.com?embed=flappy',
  ];
  if (existingUrl) {
    urls.splice(urls.indexOf(existingUrl), 1);
  }
  const url = urls[Math.floor(Math.random() * urls.length)];

  return <iframe
    className={selectors.frame}
    src={url}
    frameBorder="0"
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  ></iframe>;
}

function incrementCloseButton(button: HTMLElement) {
  const level = Number(button.dataset.level);
  if (level === 0) {
    button.style.fontWeight = 'bold';
  } else if (level === 1) {
    button.style.fontWeight = 'bolder';
  } else if (level > 3 && level < 10) {
    button.style.fontSize = `${level + 9}px`;
  }
  button.dataset.level = (level + 1).toString();
}

function hideProcrastinationFrame(e: Event) {
  document.querySelector(`.${selectors.frame}`).remove();
  document.querySelector(`.${selectors.title}`).remove();
  (e.target as HTMLElement).closest('button').remove();
  (document.querySelector('#assignment-center-list-view') as HTMLElement).style.display = '';
}

function generateTitle() {
  return (
    <div className={selectors.title}>April Fools!</div>
  );
}

function showProcrastinationFrame() {
  const existingFrame = document.querySelector(`.${selectors.frame}`) as HTMLIFrameElement;
  let existingUrl = '';
  if (existingFrame) {
    existingUrl = existingFrame.src;
    existingFrame.remove();
  }

  const frame = generateFrame(existingUrl);
  const assignmentCenter = document.querySelector('#assignment-center-list-view') as HTMLElement;

  const existingClose = document.querySelector(`.${selectors.close}`) as HTMLElement;
  if (existingClose) {
    incrementCloseButton(existingClose);
  } else {
    const closeButton = constructButton({
      textContent: 'Close Procrastination',
      iClassName: 'fa fa-times',
      onClick: hideProcrastinationFrame,
      className: selectors.close,
    });
    const title = generateTitle();
    closeButton.dataset.level = '0';
    assignmentCenter.before(closeButton);
    assignmentCenter.after(title);
  }

  assignmentCenter.style.display = 'none';
  assignmentCenter.before(frame);
}

export default async function procrastinate() {
  const addTask = await waitForLoad(() => document.querySelector('#add-task'));
  const button = constructButton({
    textContent: 'Procrastinate',
    onClick: () => {
      showProcrastinationFrame();
    },
    className: selectors.button,
  });
  addTask.before(button);
}
