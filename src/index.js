import storage from './utils/storage';
import { MODULE_MAP } from './module-map';
import options from './options';

async function loadModules() {
  let optsData = await storage.get('options');
  if (window.location.hash.startsWith('#account')) {
    options();
  }
  for (let section in optsData) {
    if (window.location.hash.startsWith(section)) {
      for (let module in optsData[section]) {
        if (optsData[section][module]) {
          const moduleFunc = MODULE_MAP[section].filter(s => s.name === module)[0];
          if (moduleFunc) {
            moduleFunc.fn();
          }
        }
      }
    }
  }

}

async function initializeOptions() {
  const optsObj = await storage.get('options') || {};
  for (let i in MODULE_MAP) {
    if ({}.hasOwnProperty.call(MODULE_MAP, i)) {
      if (!optsObj[i]) {
        optsObj[i] = {};
      }
      for (let j in MODULE_MAP[i]) {
        if ({}.hasOwnProperty.call(MODULE_MAP[i], j)) {
          const { name } = MODULE_MAP[i][j];
          if (optsObj[i][name] === undefined) optsObj[i][name] = true;
        }
      }
    }
  }
  await storage.set({ options: optsObj });
}

window.onhashchange = loadModules;

loadModules();

// TODO: only call initializeOptions on install and update
// (plus dev feature to force initialization)
initializeOptions();
