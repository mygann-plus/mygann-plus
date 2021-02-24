/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getUserId } from '~/utils/user';

const domQuery = () => document.querySelector('#assignment-center-assignment-items') as HTMLElement;

async function hideMain() {
  console.log('hiding started');
  const sched = await fetchApi(`/api/DataDirect/ScheduleList/?format=json&viewerId=${await getUserId()}&personaId=2&viewerPersonaId=2&start=1612069200&end=1615698000&_=1614184821635`);
  const container = await waitForLoad(domQuery);
  await waitForLoad(() => container.querySelector('td'));
  console.log(container.children.length);
  for (let assignment of Array.from(container.children)) {
    console.log(assignment);
    const dueElement = assignment.querySelector('td[data-heading="Due"]') as HTMLElement;
    const dueDate = new Date(dueElement.innerText.split(' ')[0]);
    const className = (assignment.querySelector('td[data-heading="Class"]') as HTMLElement).innerText;

    const target = sched.find((evt: any) => evt.title.includes(className) && evt.start.split(' ')[0] === dueDate.toLocaleDateString());

    if (!target) {
      console.log('booooo but maybe ok');
      assignment.remove();
      continue;
    }

    let classStart = new Date(target.start);

    if (dueDate.getTime() < classStart.getTime() - 6e5) (assignment as HTMLElement).remove();

    setInterval(() => (dueDate.getTime() < classStart.getTime() - 6e5) && (assignment as HTMLElement).remove(), 6e4);
  }
}

export default registerModule('{1c8109e8-eada-4239-aacd-2d892faf1af5}', {
  name: 'Hide assignments',
  main: hideMain,
});
