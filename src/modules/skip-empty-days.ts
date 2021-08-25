import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';

async function skipEmptyDaysMain() {
  console.log('running!!');
  console.log('a', window.podiumApp);
  
  let module = p3.module('schedule');
  // q.Data.DayViewDate = new Date('10/27/2021');

  let cal = await fetchApi(`/api/DataDirect/ScheduleList/?format=json&viewerId=4309545&personaId=2&viewerPersonaId=2&start=${Math.floor(new Date().getTime() / 100)}&end=${new Date('1/1/2030').getTime() / 100}`);

  

}

export default registerModule('{d6db340e-ccdd-45b9-83d6-521c0ad33f86}', {
  name: 'Skip Empty Days',
  main: skipEmptyDaysMain,
});
