import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { shuffle } from '~/utils/array';

const domQuery = {
  dropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav.nav-visible > ul') as HTMLUListElement, // eslint-disable-line max-len
  nav: () => document.querySelector('#site-nav-lower > div > ul') as HTMLUListElement,
};

async function getLinks() {
  return [
    '#studentmyday/progress',
    '#studentmyday/schedule',
    '#studentmyday/assignment-center',
    '#studentmyday/course-requests',
    '/sis-conduct/student',
    `/ems-checklists/student/mydayview/${await getUserId()}`,
  ];
}

async function shuffleMainOld() {
  const lists = [await waitForLoad(domQuery.dropdown), await waitForLoad(domQuery.nav)];
  const links = await getLinks();
  for (let list of lists) {
    shuffle(links);
    for (let el of list.children) {
      const index = Math.floor(Math.random() * links.length);
      (el.firstElementChild as HTMLLinkElement).href = links[index];
      links.splice(index, 1);
    }
  }
}

async function shuffleMain() {
  const links = await getLinks();
  const unawaitedLists = [waitForLoad(domQuery.dropdown), waitForLoad(domQuery.nav)];
  for (let list of unawaitedLists) {
    list.then(el => {
      shuffle(links);
      for (let index = 0; index < 6; index++) {
        (el.children[index].firstElementChild as HTMLLinkElement).href = links[index];
      }
    });
  }
}

export default registerModule('{ad0c15e7-7810-4ffa-bb80-5970501dda84}', {
  name: 'Shuffle shuffle',
  description: 'Shuffle the stuff in the my day dropdown',
  main: shuffleMain,
});
