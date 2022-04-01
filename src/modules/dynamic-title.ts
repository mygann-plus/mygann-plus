import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { UnloaderContext } from '~/core/module-loader';
import { addMinuteInterval } from '~/utils/tick';
import { timeStringToDate, to24Hr, isCurrentTime } from '~/utils/date';
import log from '~/utils/log';

interface ScheduleBlock {
  CalendarDate: string;
  Block: string;
  MyDayStartTime: string;
  MyDayEndTime: string;
}

async function getSchedule(filterMincha: boolean, cachedSchedule?: ScheduleBlock[]) {
  const today = new Date().toLocaleDateString();
  if (cachedSchedule && (cachedSchedule[0].CalendarDate).startsWith(today)) {
    return cachedSchedule;
  }
  const [month, day, year] = today.split('/');
  const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
  const schedule = await fetchApi(endpoint) as ScheduleBlock[];

  return schedule.filter(({ Block }) => Block !== 'Break' && (!filterMincha || Block !== 'Mincha'));
}

// check if the title was changed by MyGann+ or not
function defaultTitle(title?: string) {
  return !/\d+ min (left)|(until .+)/.test(title || document.title);
}

// to unload and revert the title
let lastTitle: string;
function changeTitle(newTitle: string) {
  if (defaultTitle()) lastTitle = document.title; // if the title is a default one it should be reverted back to it while unloading
  document.title = newTitle;
}

function clearTitle() {
  if (!defaultTitle()) document.title = lastTitle;
}

function displayTime(endTime: string, title: string) {
  const now = Date.now();
  // const now = new Date().setHours(12, 15);
  const minutesRemaining = Math.ceil((timeStringToDate(to24Hr(endTime)).getTime() - now) / 60_000);
  if (minutesRemaining <= 0) log('error', `Dynamic Title Found ${minutesRemaining} remaining in class, should be more than 0`);
  changeTitle(`${minutesRemaining} min ${title}`);
}

function updateTitle(blocks: ScheduleBlock[], showBlockName: boolean) {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`)) { // if it is during the block
      return displayTime(block.MyDayEndTime, 'left');
    } if (i < blocks.length - 1 && isCurrentTime(`${block.MyDayEndTime}-${blocks[i + 1].MyDayStartTime}`)) { // if it is between this block and the next
      return displayTime(
        blocks[i + 1].MyDayStartTime,
        `until ${showBlockName
          ? blocks[i + 1].Block
          : 'next block'}`,
      );
    }
  }
  clearTitle(); // if it didn't find it is during or between any blocks
}

async function dynamicTitleMain(opts: DynamicTitleSuboptions, unloaderContext: UnloaderContext) {
  const observer = new MutationObserver(([mutation]) => {
    const oldTitle = (mutation.removedNodes[0] as Text)?.data; // won't exist if it is the first title load
    if (defaultTitle() && !defaultTitle(oldTitle)) {
      // if it changed from a custom one to a default unchange it
      (mutation.target.firstChild as Text).data = oldTitle;
    }
  });
  observer.observe(document.querySelector('title'), { childList: true });
  unloaderContext.addFunction(() => observer.disconnect());

  let schedule = await getSchedule(opts.filterMincha);
  updateTitle(schedule, opts.showBlockName);

  const interval = addMinuteInterval(async () => {
    schedule = await getSchedule(opts.filterMincha, schedule);
    updateTitle(schedule, opts.showBlockName);
  });
  unloaderContext.addRemovable(interval);
}

function unloadDynamicTitle() {
  clearTitle();
}

interface DynamicTitleSuboptions {
  showBlockName: boolean;
  filterMincha: boolean;
}

export default registerModule('{4cb24906-d916-4732-aa8e-d61bee5033cf}', {
  name: 'Dynamic Title',
  description: 'Displays minutes remaining in class in tab title',
  init: dynamicTitleMain,
  unload: unloadDynamicTitle,
  suboptions: {
    showBlockName: {
      name: 'Display Name of Upcoming Block',
      description: 'Display the name of the upcoming block in addition to the time until it begins',
      type: 'boolean',
      defaultValue: true,
    },
    filterMincha: {
      name: 'Treat Mincha as Break',
      type: 'boolean',
      defaultValue: true,
    },
  },
});
