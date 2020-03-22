import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

// map of internal names
const sortTypes = {
  class: 'groupname',
  type: 'assignment_type',
  details: 'short_description',
  assigned: 'date_assigned',
  due: 'date_due',
  status: 'assignment_status',
};

const domQuery = (sortType: string) => {
  const header = document.querySelector(`#assignment-center-list-view th a[data-sort=${sortType}`);
  return header as HTMLElement;
};

async function defaultAssignmentSort(opts: DefaultAssignmentSortSuboptions) {
  const sortHeader = await waitForLoad(() => domQuery(opts.sortType));
  sortHeader.click();
}

// prevents reload
function unloadDefaultAssignmentSort() {}

interface DefaultAssignmentSortSuboptions {
  sortType: string;
}

export default registerModule('{9efc9b14-c418-4d64-8550-cd67766f8194}', {
  name: 'Default Assignment Sort',
  description: 'Set how the order of assignments should be sorted by default',
  main: defaultAssignmentSort,
  unload: unloadDefaultAssignmentSort,
  suboptions: {
    sortType: {
      name: 'Default Sort',
      type: 'enum',
      defaultValue: sortTypes.class,
      enumValues: {
        [sortTypes.class]: 'Class',
        [sortTypes.type]: 'Type',
        [sortTypes.details]: 'Details',
        [sortTypes.assigned]: 'Assigned',
        [sortTypes.due]: 'Due',
        [sortTypes.status]: 'Status',
      },
    },
  },
});
