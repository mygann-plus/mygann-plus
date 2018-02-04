import {
  toggleCompleted,
  inlineChangeStatus,
  autoCloseDetailStatus,
} from './modules';
const MODULE_MAP = {
  assignmentdetail: [autoCloseDetailStatus],
  'studentmyday/assignment-center': [inlineChangeStatus, toggleCompleted],
};

function loadModules() {
  for (let i in MODULE_MAP) {
    if (window.location.hash.startsWith(`#${i}`)) MODULE_MAP[i].forEach(m => m());
  }
}

window.onhashchange = loadModules;

loadModules();
