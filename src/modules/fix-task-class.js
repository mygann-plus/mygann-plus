import registerModule from '~/module';
import { waitForOne } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getTaskData, addAssignmentTableMutationObserver } from '~/shared/assignments-center';

async function getCourseName(task) {
  const { id } = task.querySelector('.label').dataset;
  const data = await getTaskData(id);
  return data.course;
}

async function fixCourseName(task) {
  const courseName = await getCourseName(task);
   // coursename != general task
  if (courseName) {
    task.querySelector('[data-heading="Class"').textContent = courseName;
  }
}

const domQuery = () => document.querySelectorAll('#assignment-center-assignment-items > *');

async function fixCourseNames() {
  const assignments = await waitForOne(domQuery);
  const tasks = Array.from(assignments).filter(assignment => {
    return assignment.querySelector('[data-index="null"]')
  })
  for (const task of tasks) {
    fixCourseName(task);
  }  
}

async function fixTaskClass(opts, unloaderContext) {
  const observer = await addAssignmentTableMutationObserver(fixCourseNames);
  unloaderContext.addRemovable(observer);
}

export default registerModule('{1ebf20e3-b910-461f-a281-fe78c22c1b8c}', {
  name: 'fix.fixTaskClass',
  main: fixTaskClass,
})