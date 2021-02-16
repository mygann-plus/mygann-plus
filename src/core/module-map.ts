import { Module } from './module';

// import userMenuLinks from '~/modules/user-menu-links'; // eslint-disable-line import/no-cycle
import userMenuLinks from '~/modules/user-menu-links'; // eslint-disable-line import/no-cycle
import admin from '~/modules/admin';

interface ModuleMap {
  [key: string]: Module[]
}

interface SectionMap {
  [key: string]: string;
}

const MODULE_MAP: ModuleMap = {
  '#': [
    userMenuLinks, // options dialog and about
  ], // universal modules
  '#login': [],
  '#assignmentdetail': [],
  '#studentmyday/assignment-center': [

  ],
  '#taskdetail': [],
  '#studentmyday/schedule': [

  ],
  '#myday/schedule-performance': [],
  '#studentmyday/progress': [

  ],
  '#message': [],
  '#message/inbox': [],
  '#message/archive': [],
  '#message/compose': [],
  '#message/conversation': [],
  '#directory/800': [],
  '#searchresults/summary': [],
  '#academicclass': [],
  '#communitypage': [],
  '#advisorypage': [],
  '#activitypage': [],
  '#myschedule': [],
  '#admin': [admin],
};

const SECTION_MAP: SectionMap = {
  '#': 'Entire Site',
  '#login': 'Login',
  '#assignmentdetail': 'Assignment Detail',
  '#studentmyday/assignment-center': 'Assignment Center',
  '#studentmyday/schedule': 'Schedule',
  '#studentmyday/progress': 'Progress',
  '#message': 'Messages',
  '#message/inbox': 'Messages Inbox',
  '#message/compose': 'Message Compose',
  '#message/conversation': 'Message Conversation',
  '#directory/800': 'Faculty & Staff Directory',
  '#searchresults/summary': 'Search Results Summary',
  '#academicclass': 'Academic Class Page',
  '#myschedule': 'Month & Week Schedule',
};

export function modulesForHash(hash: string) {
  const modules = new Set<Module>();
  for (const section in MODULE_MAP) {
    if (hash.startsWith(section)) {
      for (const module of MODULE_MAP[section]) {
        modules.add(module);
      }
    }
  }
  return modules;
}

export { MODULE_MAP, SECTION_MAP };
