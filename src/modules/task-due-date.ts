import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { compareDate } from '~/utils/date';
import { addEventListener, waitForLoad, waitForOne } from '~/utils/dom';

const domQuery = {
  inputDue: () => document.querySelector('input[name="DueDate"]') as HTMLInputElement,
  inputAssigned: () => document.querySelector('input[name="AssignedDate"]') as HTMLInputElement,
  date: () => document.querySelector('#small-date-display-label'),
  dayView: () => document.querySelector('#day-view'),
  siteModal: () => document.querySelector('#site-modal') as HTMLElement,
  addTask: () => document.querySelectorAll('#add-task'), // both mobile and desktop have the same id... wow
};

async function fixDueDate() {
  // only run if the it set to day view
  if (!domQuery.dayView().classList.contains('active')) return;
  const date = new Date(domQuery.date().textContent);

  // if selected date is after today set due, otherwise set assigned
  const input = await waitForLoad(
    compareDate(date, new Date()) === 1 ? domQuery.inputDue : domQuery.inputAssigned,
    domQuery.siteModal(),
  );

  input.value = date.toLocaleDateString();
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// $0.dispatchEvent(new Event('change',{bubbles:true}))
async function taskDueDateMain(opts: void, unloaderContext: UnloaderContext) {
  const buttons = await waitForOne(domQuery.addTask);
  console.log(buttons.length);
  for (let button of buttons) {
    const listener = addEventListener(button, 'click', fixDueDate);
    unloaderContext.addRemovable(listener);
  }
}

export default registerModule('{e722db3b-aaed-4246-afc0-7ddac3a93b87}', {
  name: 'Custom Task Due Date',
  description: 'Sets the due date of a custom task to the current date selected in assignment center',
  main: taskDueDateMain,
});
