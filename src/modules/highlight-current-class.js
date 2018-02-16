import { waitForLoad } from '../utils/dom';

const DOM_QUERY = () => {
  return document.getElementById('accordionSchedules')
        && document.getElementById('accordionSchedules').children[0]
        && document.getElementById('accordionSchedules').children[0].children
        && document.getElementById('accordionSchedules').children[0].children.length;
};

function to24Hr(t) {
  let time = t;
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  let AMPM = time.match(/\s(.*)$/)[1];
  if (AMPM == 'PM' && hours < 12) hours += 12; // eslint-disable-line eqeqeq
  if (AMPM == 'AM' && hours == 12) hours -= 12; // eslint-disable-line eqeqeq
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = `0${sHours}`;
  if (minutes < 10) sMinutes = `0${sMinutes}`;
  return `${sHours}:${sMinutes}:00`;
}

function isBetween(start, end, m) {
  const startTime = start;
  const endTime = end;

  const currentDate = new Date();

  const startDate = new Date(currentDate.getTime());
  startDate.setHours(startTime.split(':')[0]);
  startDate.setMinutes(startTime.split(':')[1]);
  startDate.setSeconds(startTime.split(':')[2]);

  const endDate = new Date(currentDate.getTime());
  endDate.setHours(endTime.split(':')[0]);
  endDate.setMinutes(endTime.split(':')[1]);
  endDate.setSeconds(endTime.split(':')[2]);


  return startDate < currentDate && endDate > currentDate;

}

function isCurrentClass(timeString) {
  const times = timeString.split('-').map(s => s.trim().split()).map(l => l[0]);
  return isBetween(to24Hr(times[0]), to24Hr(times[1]));
}

function isCurrentDay() { // the current page on the schedule is set to the current day
  const cur = document.getElementById('schedule-header')
    .children[0].children[0].children[0].children[1].children[0].children[3]
    .innerText.split(', ')[1];
  const d = new Date().toDateString();
  let month = d.split(' ')[1];
  let day = d.split(' ')[2];
  return cur.split(' ')[0].startsWith(month) && cur.split(' ')[1] === day;
}

function isCorrectFormat() { // is on day view, not month or week
  return !!document.getElementById('accordionSchedules');
}

function highlightClass() {
  waitForLoad(DOM_QUERY).then(() => {
    [].forEach.call(document.getElementById('accordionSchedules').children, c => {
      let timeString = c.children[0].childNodes[0].data.trim();
      if (isCorrectFormat() && isCurrentClass(timeString) && isCurrentDay()) {
        c.style.background = '#fff38c';
        setTimeout(() => {
          if (!document.body.contains(c)) {
            highlightClass();
          }
        }, 10);
        // c.style.background = 'url("https://i.imgur.com/BYIdZvl.jpg")'; // GOD LOVES YOU
      }
    });
  });
}

// TODO: make day change listener work

// function addDayChangeListener(btn) {
//   btn.addEventListener('click', () => {
//     highlightClass();
//     addDayChangeListeners();
//   });
// }

// function addDayChangeListeners() {
//   console.log(1);
//   waitForLoad(() => document.getElementsByClassName('chCal-button chCal-button-next')[0])
//     .then(() => {
//       console.log('listening');
//       addDayChangeListener(document.getElementsByClassName('chCal-button chCal-button-next')[0]);
//       addDayChangeListener(document.getElementsByClassName('chCal-button chCal-button-prev')[0]);
//     });
// }

export default function() {
  highlightClass();
  // addDayChangeListeners();
}
