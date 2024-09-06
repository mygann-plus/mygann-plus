import registerModule from '~/core/module';

import { waitForLoad } from '~/utils/dom';

async function changeLinks() {
  let checkString = 'lms-assignment';
  const listQuery = () => document.getElementById('assignment-center-assignment-items');
  let listTemp: any = await waitForLoad(listQuery);
  let list: any = listTemp.children;
  for (let elm of list) {
    const linkElm = elm.querySelector('[data-heading="Details"] > a');
    if (linkElm && linkElm.href && linkElm.href.includes(checkString)) {
      let button: any = elm.querySelector('td:nth-child(7) > button');
      let dataId = button.attributes['data-id'].value;
      let dataIndex = button.attributes['data-index'].value;
      let href = `https://gannacademy.myschoolapp.com/app/student#assignmentdetail/${dataId}/${dataIndex}/0/studentmyday--assignment-center`;
      elm.querySelector('[data-heading="Details"] > a').href = href;
    }
  }

}

async function mutation() {
  const buttonQuery = () => document.querySelector('#assignment-center-btn');
  const button = await waitForLoad(buttonQuery);
  // document.querySelector("#assignment-center-btn").parentElement.classList.add("active");
  button.parentElement.classList.add('active');

  const listQuery = () => document.getElementById('assignment-center-assignment-items');
  await waitForLoad(listQuery);

  const newAssignmentsListener = new MutationObserver(() => {
    changeLinks();
  });
  newAssignmentsListener.observe(document.getElementById('assignment-center-assignment-items'), {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

export default registerModule('{ee5840ca-81dd-448f-96bf-17406d48e8eb}', {
  name: 'Revert Assignment Links To Original Link',
  description:
    // eslint-disable-next-line max-len
    'Changes the url of assignments in Assignment Center to be the original one instead of the new one added in 2024-2025',
  main: mutation,
  defaultEnabled: false,
});
